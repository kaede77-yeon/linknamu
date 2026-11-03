import Image from "next/image";
import { profile } from "@/data/profile";

export default function Profile() {
  return (
    <header className="flex flex-col items-center gap-3 text-center">
      <Image
        src={profile.avatar}
        alt={`${profile.name} 프로필 사진`}
        width={112}
        height={112}
        priority
        className="h-28 w-28 rounded-full border border-slate-200 object-cover dark:border-slate-700"
      />
      <div>
        <h1 className="text-xl font-semibold">{profile.name}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {profile.bio}
        </p>
      </div>
    </header>
  );
}
