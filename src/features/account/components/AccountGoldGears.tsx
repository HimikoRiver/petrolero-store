import Image from "next/image";

/**
 * Editable vector artwork. Each gear has a separate ID and animation inside
 * /public/account/images/gold-gears.svg; no raster images or background plate.
 */
export default function AccountGoldGears() {
  return (
    <div className="pa-page-heading__gears" aria-hidden="true">
      <Image
        src="/account/images/gold-gears.svg"
        alt=""
        width={490}
        height={332}
        unoptimized
        draggable={false}
        priority
      />
    </div>
  );
}
