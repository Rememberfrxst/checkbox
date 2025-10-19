import type { Attachment } from "@/lib/types";
import { LoaderIcon } from './icons';
import Image from "next/image";

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment | null;
  isUploading?: boolean;
}) => {
  const { name = "Unknown", url = "", contentType = "" } = attachment || {};

  const isValidImage = contentType.startsWith('image') && url && typeof url === 'string';

  return (
    <div data-testid="input-attachment-preview" className="flex flex-col gap-1">
      <div className="w-20 h-16 aspect-video bg-muted rounded-md relative flex items-center justify-center overflow-hidden">
        {isValidImage ? (
          <Image
            src={url}
            alt={name || 'An image attachment'}
            width={80}
            height={64}
            className="rounded-md object-cover"
            onError={(e) => {
              console.error(`Image load failed for ${url}`);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="text-zinc-500 text-xs">Unsupported</div>
        )}
        {isUploading && (
          <div
            data-testid="input-attachment-loader"
            className="animate-spin absolute text-zinc-500"
          >
            <LoaderIcon size={24} />  {/* Updated with size prop if needed */}
          </div>
        )}
      </div>
      <div className="text-xs text-zinc-500 max-w-20 truncate">{name}</div>
    </div>
  );
};
