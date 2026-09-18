import { UserProfile } from "@/types";

export const SITE_CONFIG = {
  name: "박나림의 마이링크",
  description: "스포츠산업전공 대학생 박나림의 링크 모음",
  version: "0.1.0",
};

export const INITIAL_PROFILE: UserProfile = {
  id: "user-narim",
  username: "narim_park",
  displayName: "박나림",
  bio: "안녕하세요! 스포츠산업전공 재학중인 대학생입니다. ⚽🏃‍♀️✨",
  avatarUrl: "/profile.jpg",
  links: [
    {
      id: "1",
      title: "⚽ 스포츠 마케팅 & 대외활동 포트폴리오",
      url: "#",
      description: "스포츠 산업 관련 기획 및 프로젝트 기록 모음",
      category: "포트폴리오",
      isActive: true,
      clickCount: 0,
    },
    {
      id: "2",
      title: "📸 인스타그램 (Instagram)",
      url: "#",
      description: "일상 및 스포츠 현장 스토리",
      category: "SNS",
      isActive: true,
      clickCount: 0,
    },
    {
      id: "3",
      title: "✍️ 스포츠 인사이트 블로그",
      url: "#",
      description: "스포츠 비즈니스 & 트렌드 아티클",
      category: "블로그",
      isActive: true,
      clickCount: 0,
    },
    {
      id: "4",
      title: "✉️ 연락 및 네트워킹",
      url: "#",
      description: "이메일 및 협업 문의 링크",
      category: "연락처",
      isActive: true,
      clickCount: 0,
    },
  ],
};
