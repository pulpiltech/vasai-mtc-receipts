import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';
export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} items-center leading-none text-white`}
    >
      {/* <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" /> */}
      <Image
        src="/MTC-VASAI-logo.png"
        alt="MTC-VASAI"
        className="mx-auto"
        width={60}
        height={60}
      />
      <p className="mt-4 text-[44px]">MTC-VASAI</p>
    </div>
  );
}
