import Link from "next/link";
import { AlertTriangle, Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-3 sm:p-6">
      <Card
        variant="plate"
        className="max-w-md w-full p-4 sm:p-6 text-center space-y-4 border-2 border-[#3d4f97] shadow-lg animate-in fade-in-50 duration-200"
      >
        {/* Error Header Tag */}
        <div className="flex items-center justify-between border-b-2 border-[#3d4f97] pb-2">
          <Badge variant="nintendoRed" className="text-[10px] sm:text-xs font-black tracking-wider px-2 py-0.5">
            404 NOT FOUND
          </Badge>
          <span className="font-mono text-[10px] text-[#3d4f97] font-bold">
            ERROR: USER_NOT_EXISTS
          </span>
        </div>

        {/* Mascot / Icon Badge */}
        <div className="py-2 flex justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#f68d1f]/15 border-2 border-[#f68d1f] flex items-center justify-center text-[#f68d1f] shadow-inner">
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-[#e60012] stroke-[2.5]" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <h1 className="text-base sm:text-lg font-black text-[#21242e] uppercase tracking-tight">
            사용자를 찾을 수 없습니다
          </h1>
          <p className="text-[11px] sm:text-xs text-[#60619c] font-medium leading-relaxed">
            요청하신 닉네임의 사용자가 존재하지 않거나,
            <br />
            아직 마이링크 프로필이 등록되지 않았습니다.
          </p>
        </div>

        {/* Information Inset Box */}
        <div className="bg-white nintendo-inset p-3 rounded-[2px] text-left space-y-1 text-[10px] text-[#21242e]">
          <div className="flex items-center gap-1 font-bold text-[#e60012]">
            <Search className="w-3 h-3 shrink-0" />
            <span>확인 사항:</span>
          </div>
          <p className="text-[#60619c] leading-snug">
            • 닉네임의 철자나 대소문자, 공백을 다시 확인해주세요.
            <br />
            • 해당 유저가 아직 첫 로그인을 진행하지 않았을 수 있습니다.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button
            asChild
            variant="nintendoOrange"
            size="sm"
            className="w-full sm:w-auto h-8 px-3 text-[11px] font-black tracking-wider flex items-center justify-center gap-1.5"
          >
            <Link href="/">
              <Home className="w-3.5 h-3.5" />
              <span>메인 홈으로 이동</span>
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
