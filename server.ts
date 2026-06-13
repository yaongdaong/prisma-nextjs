// server.ts (우리가 직접 만든 "실시간 무전 기지국" 파일)

// 🏢 [택배사 불러오기] Node.js가 기본으로 제공하는 기본 인터넷 연결(HTTP) 기능 도구를 가져옵니다.
import { createServer } from 'http'
// 🧭 [나침반 불러오기] 인터넷 주소(URL)를 컴퓨터가 읽기 편하게 쪼개주는 분석 도구를 가져옵니다.
import { parse } from 'url'
// 📦 [큰 형님 불러오기] 화면을 예쁘게 그려주는 진짜 주인공 'Next.js' 시스템을 가져옵니다.
import next from 'next'
// 📡 [무전기 타워 불러오기] 실시간으로 무전 신호를 주고받게 해주는 'Socket.io' 기지국 도구를 가져옵니다.
import { Server, Socket } from 'socket.io'

// 📝 [쪽지 서식 정의] "우리가 주고받을 무전 메시지는 반드시 [아이디]와 [글자]로만 채워야 해!"라고 규칙을 정합니다.
interface ChatMessage {
    id: string  // 메시지 구별용 주민번호 (보통 시간 숫자를 넣음)
    text: string // 진짜 사람이 타이핑한 채팅 내용
}

// 🛠️ [실행 모드 체크] 지금이 내가 컴퓨터로 개발 중인 상태(development)인지 확인합니다. (맞으면 true, 아니면 false)
const dev = process.env.NODE_ENV !== 'production'
// 🏠 [내 컴퓨터 주소] 서버가 켜질 동네 이름입니다. (localhost = 내 컴퓨터 내부 주소)
const hostname = 'localhost'
// 🔌 [문 번호] 손님들이 내 컴퓨터로 찾아올 때 열고 들어올 방 번호(포트)입니다.
const port = 3000

// ⚙️ [Next.js 대기] "Next.js 형님, 방 번호 3000번에서 일할 건데 준비해 주세요!" 하고 초기화 세팅을 합니다.
const app = next({ dev, hostname, port })
// 💁‍♂️ [Next.js 매니저] 웹사이트 화면 요청(인터넷 서핑)이 들어오면 그걸 대신 처리해 줄 전용 매니저 비서를 만듭니다.
const handle = app.getRequestHandler()

// 🚀 [기지국 진짜로 가동하기] "Next.js 준비 끝났지? 그럼 이제 본격적으로 서버 문 열자!"
app.prepare().then(() => {
  
  // 1️⃣ [기본 안내데스크 만들기] 일반적인 웹사이트 접속(HTTP 요청)을 처리하는 인터넷 문을 활짝 엽니다.
  const httpServer = createServer((req, res) => {
    // 🧭 손님이 어떤 페이지 주소(예: /chat 또는 /socket-chat)로 들어왔는지 분석합니다.
    const parsedUrl = parse(req.url || '', true)
    // 💁‍♂️ "매니저님! 손님이 화면 달래요!" 하고 아까 만든 Next.js 비서에게 일거리를 토스합니다.
    handle(req, res, parsedUrl)
  })

  // 2️⃣ [안내데스크 위에 무전 기지국 얹기] 1번에서 만든 문 위에 실시간 무전 타워(Socket.io)를 똬악 설치합니다.
  const io = new Server(httpServer, {
    // 🔓 [보안 빗장 풀기] "누구든지 우리 기지국에 주파수만 맞추면 다 접속하게 허용해 줄게!" (CORS 허용)
    cors: {
      origin: '*',
    }
  })

  // 3️⃣ [무전기 접속 이벤트 리스너] "자, 지금부터 눈 똑바로 뜨고 무전기 들고 오는 손님들 감시해!"
  // 📡 어떤 손님이 브라우저를 켜서 내 기지국 주파수에 통과하면(connection) 실행되는 대장 격인 코드입니다.
  io.on('connection', (socket: Socket) => {
    // 🖥️ 검은색 개발자 터미널 창에 "⚡ 어떤 손님이 고유 번호(socket.id)를 달고 무전기 연결함!" 하고 일기를 씁니다.
    console.log('⚡ 유저가 소켓에 연결되었습니다:', socket.id)

    // 📥 [손님의 무전 대기] 접속한 그 손님이 무전기에 대고 대사를 뱉는지('message' 채널을 귀 기울여) 대기합니다.
    socket.on('message', (data: ChatMessage) => {
      // 🖥️ 손님이 "나 배고파"라고 무전을 치면 기지국 터미널에 "📩 받은 메시지: 나 배고파"라고 기록합니다.
      console.log('📩 받은 메시지:', data)

      // 📢 [동네방네 확성기] 기지국이 대형 확성기를 들고, 지금 무전기 켜고 있는 "모든 사람(io)"에게 그 대사를 그대로 흩뿌립니다.
      io.emit('message', data)
    })

    // ❌ [작별 인사 대기] 손님이 브라우저 창을 끄거나 인터넷이 끊겨서 무전기가 꺼지면(disconnect) 실행됩니다.
    socket.on('disconnect', () => {
      // 🖥️ 기지국 터미널에 "❌ 아까 그 손님 나갔음" 하고 일기를 씁니다.
      console.log('❌ 유저 연결 해제:', socket.id)
    })
  })

  // 🏁 [완전 가동 시작] "준비 끝! 이제 진짜로 3000번 방 문 열고 손님들 맞이해라!"
  httpServer.listen(port, () => {
    // 🖥️ 서버가 정상적으로 켜지면 터미널에 "> Ready on http://localhost:3000" 이라고 이쁘게 띄워줍니다.
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})