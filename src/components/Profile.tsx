import Image from "next/image";
import { profile } from "@/data/profile";

export default function Profile() {
  return (
    <header className="flex flex-col items-center gap-5 text-center">
      <div className="rounded-full bg-white/50 p-1.5 shadow-[0_10px_30px_-14px_rgba(120,84,60,0.45)] backdrop-blur-sm dark:bg-white/10">
        <Image
          src={profile.avatar}
          alt={`${profile.name} 프로필 사진`}
          width={112}
          height={112}
          priority
          className="h-28 w-28 rounded-full object-cover"
        />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">{profile.name}</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          {profile.bio}
        </p>
      </div>
    </header>
  );
}
