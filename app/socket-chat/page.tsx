// app/socket-chat/page.tsx
'use client';
// 📱 [브라우저 전용] "이 코드는 서버가 아니라 사용자 핸드폰(브라우저) 화면에서 돌아가는 코드야!"라고 선언합니다.

// 🛠️ [재료 가져오기] 화면을 만들 때 필요한 React 핵심 도구들과 소켓 연결 도구를 서랍에서 꺼냅니다.
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client'; // 📡 클라이언트(유저)용 소켓 무전기 도구입니다.

// 📟 [무전기 보관함] 내 무전기 장치를 담아둘 빈 상자를 만듭니다.
// (컴포넌트 밖에 둬서 화면이 바뀌어도 무전기가 초기화되지 않게 잡고 있습니다.)
let socket: Socket;

export default function SocketChatPage() {
    // 📝 [대화 기록장] 화면에 보일 채팅 메시지들을 담는 배열 상자입니다. (처음엔 빈 방 `[]`)
    const [messages, setMessages] = useState<{ id: string; text: string }[]>([]);
    // ✍️ [입력창 글자] 사용자가 키보드로 치고 있는 '실시간 글자'를 임시로 붙잡아두는 상자입니다.
    const [inputText, setInputText] = useState('');

    // ⏳ [무전기 전원 켜기] 사용자가 이 채팅 페이지에 딱 들어왔을 때 '처음 한 번만' 실행되는 마법의 구역입니다.
    useEffect(() => {
        // 1️⃣ [주파수 맞추기] 내 서버 기지국 주소로 무전기 채널을 맞추고 연결(io)을 시도합니다.
        socket = io();

        // 2️⃣ [기지국 방송 대기] 기지국 확성기에서 'message'라는 소리가 들리는지 귀를 쫑긋 세우고 기다립니다. (on)
        socket.on('message', (data: { id: string; text: string }) => {
            // 📥 기지국이 "새 메시지 왔다!" 하고 대사(data)를 던져주면, '
            // 기존 대화 기록장(`prev`) 뒤에 새 메시지를 쏙 이어 붙입니다.
            setMessages((prev) => [...prev, data]);
        });

        // ❌ [무전기 끄기] 사용자가 채팅방을 나가거나 다른 페이지로 이동할 때 자동으로 실행됩니다.
        return () => {
            socket.disconnect(); // "기지국님, 저 무전기 끌게요!" 하고 안전하게 연결을 끊습니다.
        };
    }, []); // 💡 뒤에 빈 배열 `[]`이 있으면 "페이지 처음 열릴 때 딱 한 번만 하라"는 뜻입니다.

    // 🚀 [보내기 버튼 누를 때] 사용자가 글을 쓰고 엔터를 치거나 '전송' 버튼을 누르면 작동하는 함수입니다.
    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        // 🛑 [새로고침 방지] 엔터 쳤을 때 브라우저가 깜빡거리면서 페이지가 리셋되는 못된 기본 버릇을 막아줍니다.
        if (!inputText.trim()) return;
        // 🙅‍♂️ 입력창에 공백(스페이스바)만 있거나 아무것도 안 썼으면 전송 안 하고 그냥 취소합니다.

        // 📦 [전송용 데이터 상자] 기지국으로 보낼 이쁜 소포 상자를 포장합니다.
        const messageData = {
            id: String(Date.now()), // 🆔 메시지가 겹치지 않게 '현재 시간의 밀리초(컴퓨터 주민번호)'를 아이디로 씁니다.
            text: inputText, // 💬 사용자가 입력창에 열심히 타이핑한 진짜 글자 내용을 담습니다.
        };

        // 3️⃣ [기지국 향해 쏘기] 포장한 소포 상자를 기지국의 'message' 채널을 향해 퓽~! 하고 던집니다. (emit)
        socket.emit('message', messageData);
        // 🧼 [입력창 청소] 글을 보냈으니 다음 글을 쓸 수 있도록 입력창을 다시 빈 글자(`''`)로 깨끗하게 지워줍니다.
        setInputText('');
    };

    // 🎨 [도화지 - 화면 그리기] HTML과 CSS(style)를 이용해 내 무전기 인터페이스를 눈에 보이게 그립니다.
    return (
        <div style={{ padding: '20px', maxWidth: '400px' }}>
            <h2>커스텀 소켓 실시간 채팅</h2>

            {/* 📜 [채팅 전용 대화창] 글들이 쌓이면 스크롤이 생기는 회색 상자입니다. */}
            <div
                style={{
                    border: '1px solid #ccc',
                    height: '300px',
                    overflowY: 'scroll', // ↕️ 글이 많아지면 아래로 스크롤바가 생기게 합니다.
                    padding: '10px',
                    marginBottom: '10px',
                    backgroundColor: '#eaeaea', // 회색 바탕
                }}>
                {/* 🔄 [도장 찍기] 대화 기록장(messages)에 들어있는 메시지 개수만큼 반복해서 화면에 그려줍니다. */}
                {messages.map((msg) => (
                    <div
                        key={msg.id} // 💡 React가 각각의 말풍선을 헷갈리지 않고 정확히 추적할 수 있게 고유한 주민번호(id)를 명시합니다.
                        style={{
                            margin: '5px 0',
                            padding: '5px 10px',
                            backgroundColor: '#fff', // 말풍선은 하얀색
                            borderRadius: '5px',
                        }}>
                        {msg.text} {/* 💬 진짜 채팅 글자를 말풍선 안에 쏙 출력합니다. */}
                    </div>
                ))}
            </div>

            {/* ⌨️ [입력 창 양식] 글자 입력 칸과 전송 버튼이 한 몸으로 묶여 있는 그룹입니다. */}
            <form onSubmit={sendMessage} style={{ display: 'flex', gap: '5px' }}>
                <input
                    type='text'
                    value={inputText} // ✍️ 이 상자의 텍스트는 React 상자(`inputText`)와 늘 똑같이 움직입니다.
                    onChange={(e) => setInputText(e.target.value)}
                    // 🖐️ 사용자가 키보드를 한 글자 칠 때마다 그 글자를 읽어서 상자에 실시간 업데이트합니다.
                    style={{ flex: 1, padding: '5px' }} // 입력창이 남은 가로 공간을 다 채우도록 늘려줍니다.
                    placeholder='서버 소켓으로 전송...'
                />
                <button type='submit' style={{ padding: '5px 15px' }}>
                    전송
                </button>
            </form>
        </div>
    );
}
