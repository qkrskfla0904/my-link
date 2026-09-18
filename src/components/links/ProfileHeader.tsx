import Image from "next/image";
import { UserProfile } from "@/types";

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      {/* Avatar Image */}
      <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-lg ring-4 ring-emerald-400/50 dark:ring-emerald-500/40 mb-4 bg-gradient-to-tr from-emerald-400 to-teal-600">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={profile.displayName}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
            {profile.displayName.slice(0, 1)}
          </div>
        )}
      </div>

      {/* Name */}
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
        {profile.displayName}
      </h1>

      {/* Specialty Badge */}
      <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
        {(profile.tags && profile.tags.length > 0
          ? profile.tags
          : ["💻 프론트엔드 개발자", "🚀 Next.js & React"]
        ).map((tag, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
              idx % 2 === 0
                ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-3 max-w-md leading-relaxed">
          {profile.bio}
        </p>
      )}
    </div>
  );
}
