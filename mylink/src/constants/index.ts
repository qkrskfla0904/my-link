import { UserProfile } from "@/types";

export const SITE_CONFIG = {
  name: "박나림의 마이링크",
  description: "더 나은 사용자 경험을 고민하는 프론트엔드 개발자 박나림의 링크 모음",
  version: "0.1.0",
};

export const INITIAL_PROFILE: UserProfile = {
  id: "user-narim",
  username: "narim_park",
  displayName: "박나림",
  bio: "안녕하세요! 사용자 경험과 직관적인 인터페이스를 만드는 프론트엔드 개발자 박나림입니다. 💻🚀✨",
  avatarUrl: "/profile.jpg",
  tags: ["💻 프론트엔드 개발자", "🚀 Next.js & React"],
  links: [
    {
      id: "1",
      title: "💻 GitHub & 포트폴리오",
      url: "#",
      description: "개발 프로젝트 코드 저장소 및 기획 기록 모음",
      category: "포트폴리오",
      isActive: true,
      clickCount: 0,
    },
    {
      id: "2",
      title: "📝 기술 블로그 (Tech Blog)",
      url: "#",
      description: "개발 트렌드, 트러블슈팅 및 학습 일지 기록",
      category: "블로그",
      isActive: true,
      clickCount: 0,
    },
    {
      id: "3",
      title: "💼 LinkedIn (커리어 프로필)",
      url: "#",
      description: "이력서 및 프로젝트 협업 이력",
      category: "SNS",
      isActive: true,
      clickCount: 0,
    },
    {
      id: "4",
      title: "✉️ 연락 및 커피챗 신청",
      url: "#",
      description: "이메일 및 협업 문의 링크",
      category: "연락처",
      isActive: true,
      clickCount: 0,
    },
  ],
};
