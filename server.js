const http = require('http');
const crypto = require('crypto');
const url = require('url');
const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, 'public');
const artworkDir = path.join(publicDir, 'artwork');
const assetsDir = path.join(__dirname, 'assets');

// In-memory stores (for demo purposes)
const sessions = new Map(); // token -> {userId,created,history:{matches:[],events:[]},settings:{},energySent:0,energyReceived:0}
// event record also tracks total energy exchanged
const events = new Map(); // id -> {id,startTime,symbol,mood,creator,participants:Set,status:'scheduled',startTs:0,endTs:0,energy:0}
const wsClients = new Map(); // token -> ws connection
const matchQueue = []; // tokens waiting for match
// active match stores per user energy counters
const activeMatches = new Map(); // matchId -> {users:[tokenA, tokenB], start, energy:{[token:string]:number}}
let nextEventId = 1;
let nextUserId = 1;
let nextMatchId = 1;
// premium features: resonance links and group rooms
const resonanceLinks = new Map(); // id -> {id,from,to,createdAt,active}
let nextLinkId = 1;
const rooms = new Map(); // id -> {id,name,description,start,end,creator,isPublic,participants:Set}
let nextRoomId = 1;
const roomSockets = new Map(); // roomId -> Map(token,ws)
const allowedMoods = ['rain','sun','night','ember','fog','ocean'];

function generateToken(){
  return crypto.randomBytes(16).toString('hex');
}

function jsonResponse(res, code, obj){
  const data = JSON.stringify(obj);
  res.writeHead(code, {'Content-Type':'application/json'});
  res.end(data);
}

function notFound(res){
  res.writeHead(404);res.end();
}

function parseBody(req){
  return new Promise((resolve, reject)=>{
    let data='';
    req.on('data', chunk=>{ data+=chunk; });
    req.on('end', ()=>{
      if(data){
        try { resolve(JSON.parse(data)); } catch(e){ reject(e); }
      } else resolve({});
    });
  });
}

function broadcastEvent(tokens, payload){
  const msg = JSON.stringify(payload);
  tokens.forEach(t => {
    const ws = wsClients.get(t);
    if(ws && ws.writable){ try{ ws.write(frame(msg)); }catch(e){}}
  });
}

// Simple WebSocket frame helpers (only text frames, no fragmentation)
function frame(data){
  const payload = Buffer.from(data);
  const len = payload.length;
  let header;
  if(len < 126){ header = Buffer.alloc(2); header[1]=len; }
  else if(len<65536){ header=Buffer.alloc(4); header[1]=126; header.writeUInt16BE(len,2);} 
  else { header=Buffer.alloc(10); header[1]=127; header.writeBigUInt64BE(BigInt(len),2);} 
  header[0]=0x81; // FIN + text
  return Buffer.concat([header,payload]);
}

function parseFrame(buffer){
  const b1 = buffer[0];
  const opcode = b1 & 0x0f;
  if(opcode === 0x8) return {close:true};
  const masked = buffer[1] & 0x80;
  let len = buffer[1] & 0x7f;
  let offset = 2;
  if(len === 126){ len = buffer.readUInt16BE(2); offset=4; }
  else if(len===127){ len = Number(buffer.readBigUInt64BE(2)); offset=10; }
  let mask;
  if(masked){ mask=buffer.slice(offset, offset+4); offset+=4; }
  let payload = buffer.slice(offset, offset+len);
  if(masked){ for(let i=0;i<payload.length;i++) payload[i]^=mask[i%4]; }
  return {data: payload.toString()};
}

function handleWsMessage(token, msg){
  let obj;
  try{ obj = JSON.parse(msg); }catch(e){ return; }
  if(obj.action === 'send_energy'){
    if(obj.targetUser){
      const toSession = Array.from(sessions.values()).find(s=>s.userId===obj.targetUser);
      if(toSession){ toSession.energyReceived++; }
      sessions.get(token).energySent++;
      for(const [id,m] of activeMatches){
        if(m.users.includes(token) && m.users.includes(Array.from(sessions.entries()).find(([k,v])=>v.userId===obj.targetUser)?.[0])){
          const otherToken = m.users.find(t=>t!==token);
          m.energy[token] = (m.energy[token]||0)+1;
          m.energy[otherToken] = m.energy[otherToken]||0; // ensure other field
        }
      }
      broadcastEvent([obj.targetUser], {event:'energy', from:sessions.get(token).userId, context:'match'});
    } else if(obj.targetEvent){
      const ev = events.get(obj.targetEvent);
      if(ev){
        sessions.get(token).energySent++;
        ev.energy++;
        ev.participants.forEach(t=>{ if(t!==token){ const s=sessions.get(t); if(s) s.energyReceived++; }});
        broadcastEvent(Array.from(ev.participants), {event:'energy', from:sessions.get(token).userId, context:'event'});
      }
    }
  }
}

const server = http.createServer(async (req,res)=>{
  const parsed = url.parse(req.url,true);
  const pathname = parsed.pathname || '/';

  if(req.method==='GET' && pathname==='/health'){
    res.writeHead(200,{'Content-Type':'text/plain'});res.end('OK');
    return;
  }

  // Serve static files
  if(req.method === 'GET' && !pathname.startsWith('/api') && pathname !== '/ws'){
    if(pathname.startsWith('/assets/')){
      const full = path.join(assetsDir, pathname.substring('/assets/'.length));
      if(full.startsWith(assetsDir)){
        fs.readFile(full,(err,data)=>{
          if(err){ notFound(res); return; }
          const ext = path.extname(full);
          const types = {'.mp3':'audio/mpeg'};
          res.writeHead(200,{ 'Content-Type': types[ext] || 'application/octet-stream' });
          res.end(data);
        });
        return;
      }
    }
    let file = pathname === '/' ? '/index.html' : pathname;
    const full = path.join(publicDir, file);
    if(full.startsWith(publicDir)){
      fs.readFile(full, (err,data)=>{
        if(err){ notFound(res); return; }
        const ext = path.extname(full);
        const types = {'.js':'application/javascript','.json':'application/json','.css':'text/css','.jsx':'text/javascript','.html':'text/html'};
        res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'});
        res.end(data);
      });
      return;
    }
  }
  // Simple auth via session token header
  const token = req.headers['x-session'] || (req.headers.cookie||'').split('session_id=')[1];
  const session = token ? sessions.get(token) : null;

  if(req.method==='POST' && pathname==='/api/session'){
    const body = await parseBody(req).catch(()=>null);
    const newToken = generateToken();
    const userId = 'U'+(nextUserId++);
    const premium = body && body.premium === true;
    sessions.set(newToken,{userId,created:Date.now(),premium,history:{matches:[],events:[]},settings:{},energySent:0,energyReceived:0});
    res.writeHead(201,{'Set-Cookie':`session_id=${newToken}; HttpOnly`,'Content-Type':'application/json'});
    res.end(JSON.stringify({sessionToken:newToken,userId,premium}));
    return;
  }
  if(!session){ res.writeHead(401);res.end();return; }

  // authenticated routes
  if(req.method==='DELETE' && pathname==='/api/session'){
    sessions.delete(token); res.writeHead(204);res.end(); return;
  }
  if(req.method==='GET' && pathname==='/api/profile'){
    jsonResponse(res,200,{created:session.created,premium:session.premium,matchesCount:session.history.matches.length,eventsCount:session.history.events.length,energySent:session.energySent,energyReceived:session.energyReceived,settings:session.settings});
    return;
  }
  if(req.method==='PUT' && pathname==='/api/profile'){
    const body = await parseBody(req).catch(()=>null);
    if(body && body.settings){ session.settings=body.settings; }
    jsonResponse(res,200,{settings:session.settings});
    return;
  }
  if(req.method==='DELETE' && pathname==='/api/profile'){
    sessions.delete(token); jsonResponse(res,204,{}); return;
  }
  if(req.method==='GET' && pathname==='/api/events'){
    const list = Array.from(events.values()).map(e=>({id:e.id,startTime:e.startTime,symbol:e.symbol,mood:e.mood,participants:e.participants.size,status:e.status,energy:e.energy}));
    jsonResponse(res,200,list); return;
  }
  if(req.method==='POST' && pathname==='/api/events'){
    const body = await parseBody(req).catch(()=>null);
    if(!body || !body.startTime || !body.symbol){ jsonResponse(res,400,{error:'invalid'}); return; }
    let mood = body.mood;
    if(mood){
      if(!session.premium){ jsonResponse(res,403,{error:'premium required'}); return; }
      if(!allowedMoods.includes(mood)) mood = undefined;
    }
    const id='E'+(nextEventId++);
    const startTs = new Date(body.startTime).getTime();
    events.set(id,{id,startTime:body.startTime,symbol:body.symbol,mood:mood||null,creator:token,participants:new Set([token]),status:'scheduled',startTs,endTs:startTs+5*60*1000,energy:0});
    session.history.events.push({id,startTime:body.startTime,symbol:body.symbol,mood:mood||null});
    jsonResponse(res,201,{id,startTime:body.startTime,symbol:body.symbol,mood:mood||null});
    return;
  }
  const eventDetailMatch = path.match(/^\/api\/events\/(E\d+)$/);
  if(req.method==='GET' && eventDetailMatch){
    const ev = events.get(eventDetailMatch[1]);
    if(!ev){ notFound(res); return; }
    jsonResponse(res,200,{id:ev.id,startTime:ev.startTime,symbol:ev.symbol,mood:ev.mood,participants:ev.participants.size,status:ev.status,energy:ev.energy});
    return;
  }
  const eventJoinMatch = path.match(/^\/api\/events\/(E\d+)\/join$/);
  if(req.method==='POST' && eventJoinMatch){
    const ev = events.get(eventJoinMatch[1]);
    if(!ev){ notFound(res); return; }
    ev.participants.add(token);
    session.history.events.push({id:ev.id,startTime:ev.startTime,symbol:ev.symbol,mood:ev.mood});
    broadcastEvent(Array.from(ev.participants),{event:'participant_joined',eventId:ev.id,count:ev.participants.size});
    jsonResponse(res,200,{}) ; return;
  }
  const eventLeaveMatch = path.match(/^\/api\/events\/(E\d+)\/leave$/);
  if(req.method==='POST' && eventLeaveMatch){
    const ev = events.get(eventLeaveMatch[1]);
    if(ev){
      ev.participants.delete(token);
      broadcastEvent(Array.from(ev.participants),{event:'participant_left',eventId:ev.id,count:ev.participants.size});
    }
    res.writeHead(204);res.end(); return;
  }
  if(req.method==='POST' && pathname==='/api/match'){
    if(!matchQueue.includes(token)) matchQueue.push(token);
    res.writeHead(200,{ 'Content-Type':'application/json'});res.end(JSON.stringify({status:'searching'}));
    tryMatch();
    return;
  }
  if(req.method==='DELETE' && pathname==='/api/match'){
    const idx = matchQueue.indexOf(token);
    if(idx>=0) matchQueue.splice(idx,1);
    // check if in active match
    for(const [id,m] of activeMatches){
      if(m.users.includes(token)){
        endMatch(id,'partner_left');
        break;
      }
    }
    res.writeHead(204);res.end(); return;
  }
  if(req.method==='POST' && pathname==='/api/energy'){
    const body = await parseBody(req).catch(()=>null);
    if(body.targetUser){
      const toSession = Array.from(sessions.values()).find(s=>s.userId===body.targetUser);
      if(toSession){ toSession.energyReceived++; }
      session.energySent++;
      for(const [id,m] of activeMatches){
        const otherToken = m.users.find(t=>sessions.get(t)?.userId===body.targetUser);
        if(otherToken && m.users.includes(token)){
          m.energy[token] = (m.energy[token]||0)+1;
          m.energy[otherToken] = m.energy[otherToken]||0;
        }
      }
      broadcastEvent([body.targetUser],{event:'energy',from:session.userId,context:'match'});
      res.writeHead(204);res.end();return;
    }
    if(body.targetEvent){
      const ev = events.get(body.targetEvent);
      if(ev){
        session.energySent++;
        ev.energy++;
        ev.participants.forEach(t=>{ if(t!==token){ const s=sessions.get(t); if(s) s.energyReceived++; }});
        broadcastEvent(Array.from(ev.participants),{event:'energy',from:session.userId,context:'event'});
      }
      res.writeHead(204);res.end();return;
    }
    jsonResponse(res,400,{error:'invalid target'});return;
  }
  // --- Resonance Links (premium) ---
  if(req.method==='POST' && pathname==='/api/resonance-links'){
    const body = await parseBody(req).catch(()=>null);
    const targetUser = body?.to_user_id;
    if(!targetUser){ jsonResponse(res,400,{error:'invalid'}); return; }
    const exists = Array.from(resonanceLinks.values()).find(l=>l.from===token && l.to===targetUser && l.active);
    if(exists){ jsonResponse(res,409,{error:'exists'}); return; }
    const id='L'+(nextLinkId++);
    resonanceLinks.set(id,{id,from:token,to:targetUser,createdAt:Date.now(),active:true});
    jsonResponse(res,201,{id});
    return;
  }
  if(req.method==='GET' && pathname==='/api/resonance-links'){
    const list = Array.from(resonanceLinks.values()).filter(l=>l.from===token && l.active).map(l=>{
      const targetToken = Array.from(sessions.entries()).find(([k,v])=>v.userId===l.to)?.[0];
      return {id:l.id,active:l.active,partner_present: wsClients.has(targetToken||''),last_seen:new Date(l.createdAt).toISOString()};
    });
    jsonResponse(res,200,list); return;
  }
  const linkDelMatch = pathname.match(/^\/api\/resonance-links\/(L\d+)$/);
  if(req.method==='DELETE' && linkDelMatch){
    const l = resonanceLinks.get(linkDelMatch[1]);
    if(l && l.from===token){ l.active=false; }
    res.writeHead(204);res.end(); return;
  }
  // --- Resonance Rooms (premium) ---
  if(req.method==='POST' && pathname==='/api/rooms'){
    const body = await parseBody(req).catch(()=>null);
    if(!body || !body.name || !body.start_time || !body.end_time){ jsonResponse(res,400,{error:'invalid'}); return; }
    const id='R'+(nextRoomId++);
    rooms.set(id,{id,name:body.name,description:body.description||'',start:new Date(body.start_time).getTime(),end:new Date(body.end_time).getTime(),creator:token,isPublic:body.is_public!==false,participants:new Set()});
    jsonResponse(res,201,{id}); return;
  }
  if(req.method==='GET' && pathname==='/api/rooms/upcoming'){
    const now=Date.now();
    const list=Array.from(rooms.values()).filter(r=>r.end>now).map(r=>({id:r.id,name:r.name,start_time:new Date(r.start).toISOString(),end_time:new Date(r.end).toISOString(),participants:r.participants.size}));
    jsonResponse(res,200,list);return;
  }
  const joinRoomMatch=pathname.match(/^\/api\/rooms\/(R\d+)\/join$/);
  if(req.method==='POST' && joinRoomMatch){
    const r=rooms.get(joinRoomMatch[1]);
    if(!r){ notFound(res); return; }
    r.participants.add(token);
    jsonResponse(res,200,{}); return;
  }
  if(req.method==='GET' && pathname==='/api/artwork'){
    function walk(dir){
      let results = [];
      for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
        const full = path.join(dir, entry.name);
        if(entry.isDirectory()){
          results = results.concat(walk(full));
        } else {
          const rel = path.relative(artworkDir, full).split(path.sep).map(encodeURIComponent).join('/');
          results.push('/artwork/' + rel);
        }
      }
      return results;
    }
    jsonResponse(res,200,walk(artworkDir));
    return;
  }
  if(req.method==='GET' && pathname==='/api/history'){
    jsonResponse(res,200,session.history); return;
  }
  notFound(res);
});

function tryMatch(){
  if(matchQueue.length>=2){
    const a = matchQueue.shift();
    const b = matchQueue.shift();
    const id='M'+(nextMatchId++);
    const start=Date.now();
    activeMatches.set(id,{users:[a,b],start,energy:{[a]:0,[b]:0}});
    sessions.get(a).history.matches.push({id,start,partner:sessions.get(b).userId});
    sessions.get(b).history.matches.push({id,start,partner:sessions.get(a).userId});
    broadcastEvent([a,b],{event:'match_found',partnerId:sessions.get(b).userId,matchId:id});
    setTimeout(()=>endMatch(id,'timeout'),5*60*1000);
  }
}

function endMatch(id,reason){
  const m = activeMatches.get(id);
  if(!m) return;
  activeMatches.delete(id);
  const duration = Math.round((Date.now()-m.start)/60000);
  m.users.forEach(t=>{
    const hist = sessions.get(t)?.history.matches.find(mm=>mm.id===id);
    if(hist){
      hist.durationMin=duration;
      hist.energyExchanged = m.energy[t] + (m.energy[m.users.find(u=>u!==t)]||0);
    }
  });
  broadcastEvent(m.users,{event:'match_ended',reason});
}

server.on('upgrade',(req,socket,head)=>{
  const parsed = url.parse(req.url,true);
  const roomMatch = parsed.pathname.match(/^\/ws\/rooms\/(R\d+)$/);
  const isMain = parsed.pathname === '/ws';
  if(!isMain && !roomMatch){ socket.destroy(); return; }
  const token = (req.headers.cookie||'').split('session_id=')[1];
  if(!token || !sessions.has(token)){ socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n'); socket.destroy(); return; }
  const key = req.headers['sec-websocket-key'];
  const accept = crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${accept}`,
    '\r\n'
  ];
  socket.write(headers.join('\r\n'));
  if(isMain){
    wsClients.set(token,socket);
    socket.on('data',buf=>{
      const msg = parseFrame(buf);
      if(msg.close){ socket.end(); wsClients.delete(token); return; }
      if(msg.data) handleWsMessage(token,msg.data);
    });
    socket.on('close',()=>{
      wsClients.delete(token);
      for(const [id,m] of activeMatches){
        if(m.users.includes(token)) endMatch(id,'disconnect');
      }
    });
  } else if(roomMatch){
    const roomId = roomMatch[1];
    const room = rooms.get(roomId);
    if(!room){ socket.destroy(); return; }
    let map = roomSockets.get(roomId);
    if(!map){ map = new Map(); roomSockets.set(roomId,map); }
    map.set(token,socket);
    const broadcast = ()=>{
      const msg = frame(JSON.stringify({event:'room_presence',room:roomId,count:map.size}));
      for(const ws of map.values()){ try{ ws.write(msg); }catch(e){} }
    };
    broadcast();
    socket.on('data',buf=>{ const m=parseFrame(buf); if(m.close){ socket.end(); }});
    socket.on('close',()=>{ map.delete(token); broadcast(); });
  }
});

setInterval(()=>{
  const now = Date.now();
  for(const [id,ev] of events){
    if(ev.status==='scheduled' && now>=ev.startTs){
      ev.status='ongoing';
      broadcastEvent(Array.from(ev.participants),{event:'event_start',eventId:id});
    }
    if(ev.status==='ongoing' && now>=ev.endTs){
      broadcastEvent(Array.from(ev.participants),{event:'event_end',eventId:id});
      ev.participants.forEach(t=>{
        const sess = sessions.get(t);
        if(sess){
          const rec = sess.history.events.find(e=>e.id===id);
          if(rec) rec.energy = ev.energy;
        }
      });
      events.delete(id);
    }
  }
},1000);

server.listen(3000,()=>console.log('Luma server listening on :3000'));
