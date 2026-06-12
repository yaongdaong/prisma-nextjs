import { prisma } from '@/lib/prisma';
// Prisma가 만든 User 타입을 가져옵니다 (대문자 U)
import { User } from '@prisma/client';

export default async function DbPage() {
    // 1. 임시 테이스: 데이터가 하나도 없다면 자동으로 하나 생성
    const count = await prisma.user.count();
    if (count === 0) {
        await prisma.user.create({
            data: {
                email: 'hello@prisma.com',
                name: '프리즘',
            },
        });
    }
    // 2. 유저 목록 다시 불렁괴
    const users = await prisma.user.findMany();

    return (
        <div>
            <h1>DB 테스트</h1>

            {/* user에 User 타입을 직접 지정 */}
            {users.map((user: User) => (
                <div key={user.id}>
                    {user.id} - {user.email}
                </div>
            ))}
        </div>
    );
}
