import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center text-white w-full py-4`}
    >
      <div className="bg-white p-1.5 rounded-lg mr-3 shadow-sm shrink-0">
        <Image
          src="/MTC-VASAI-logo.png"
          alt="MTC-VASAI Logo"
          width={45}
          height={45}
          className="object-contain"
        />
      </div>
      <p className="text-[22px] font-semibold leading-tight tracking-wide">
        MTC-VASAI<br />RECEIPTS
      </p>
    </div>
  );
}
