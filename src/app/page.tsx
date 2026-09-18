import { INITIAL_PROFILE } from "@/constants";
import { ProfileHeader } from "@/components/links/ProfileHeader";
import { LinkCard } from "@/components/links/LinkCard";

export default function HomePage() {
  const profile = INITIAL_PROFILE;

  return (
    <div className="max-w-md mx-auto px-4 py-10 min-h-[calc(100vh-7rem)] flex flex-col justify-between">
      <div>
        {/* Profile Header */}
        <ProfileHeader profile={profile} />

        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            📌 링크 모음 (Link Collection)
          </h2>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {profile.links.length}개 버튼 준비됨
          </span>
        </div>

        {/* Link Buttons */}
        <div className="space-y-3">
          {profile.links.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      </div>

      {/* Info Card for adding links later */}
      <div className="mt-12 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 text-center">
        <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
          💡 나중에 추가하고 싶으신 SNS, 블로그, 포트폴리오 주소를 알려주시면 바로 버튼에 연결해 드립니다!
        </p>
      </div>
    </div>
  );
}
