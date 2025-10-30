"use client"

import { startTransition, useMemo, useOptimistic, useState, useEffect } from "react"
import Image from "next/image"
import { saveChatModelAsCookie } from "@/app/(chat)/actions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { chatModels } from "@/lib/ai/models"
import { cn } from "@/lib/utils"
import { ChevronDown, Brain } from "lucide-react"
import type { Session } from "next-auth"

// Simple useMediaQuery hook
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}

export function ModelSelector({
  session,
  selectedModelId,
  onModelChange,
  className,
  disabled,
}: {
  session: Session | null
  selectedModelId: string
  onModelChange?: (modelId: string) => void
  className?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [optimisticModelId, setOptimisticModelId] = useOptimistic(selectedModelId)

  // Load from localStorage on mount for instant experience
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedModel = localStorage.getItem('selectedModel')
      if (savedModel && savedModel !== selectedModelId) {
        // Wrap optimistic update in a transition to satisfy React concurrent update rules
        startTransition(() => {
          setOptimisticModelId(savedModel)
        })
      }
    }
  }, [])

  const isMobile = useMediaQuery("(max-width: 767px)")

  // ✅ Show all models without entitlement restriction
  const availableChatModels = chatModels

  const selectedChatModel = useMemo(() => {
    // If in thinking mode, show the original selected model in UI
    let isThinkingMode = false;
    let displayModelId = optimisticModelId;

    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      try {
        isThinkingMode = sessionStorage.getItem('thinkingMode') === 'true';
        displayModelId = isThinkingMode
          ? (sessionStorage.getItem('previousModel') || optimisticModelId)
          : optimisticModelId;
      } catch (e) {
        // In rare restricted environments sessionStorage may throw. Fail safe to optimisticModelId.
        console.warn('sessionStorage read failed in ModelSelector:', e);
        displayModelId = optimisticModelId;
      }
    }

    return availableChatModels.find((chatModel) => chatModel.id === displayModelId) || null;
  }, [optimisticModelId, availableChatModels])

  const handleModelSelect = async (modelId: string) => {
    try {
      // Start preloading the model immediately
      fetch('/api/preload-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId }),
      }).catch(() => {}); // Fire and forget

      // Immediate UI feedback with loading state
      startTransition(() => {
        setOptimisticModelId(modelId);
        setOpen(false);
      });

      // Parallel state updates for instant feedback
      await Promise.all([
        // Local storage update
        new Promise<void>((resolve) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('selectedModel', modelId);
            localStorage.setItem('modelSwitchTimestamp', Date.now().toString());
          }
          resolve();
        }),
        // Cookie update in background
        saveChatModelAsCookie(modelId).catch(console.warn)
      ]);

      // Callback after model is ready
      if (onModelChange) {
        onModelChange(modelId);
      }
    } catch (error) {
      console.error('Model switch error:', error);
      // Fallback UI update: ensure this optimistic update is wrapped in a transition
      startTransition(() => {
        setOptimisticModelId(modelId);
      })
      if (onModelChange) {
        onModelChange(modelId);
      }
    }
  }

  // Tag checking functions
  const hasReasoningTag = (model: any) => model.hasReasoningTag
  const hasComingTag = (model: any) => model.hasComingTag
  const hasNewTag = (model: any) => model.hasNewTag

  // Dynamically compute mobile sheet height to fit content (with scroll if overflow)
  const [sheetHeight, setSheetHeight] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (isMobile) {
      const headerHeight = 52
      const modelItemHeight = 80
      const contentPad = 16
      const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800

      const n = availableChatModels.length
      const neededHeight = Math.min(
        headerHeight + n * modelItemHeight + contentPad,
        viewportHeight * 0.8
      )
      setSheetHeight(`${neededHeight}px`)
    } else {
      setSheetHeight(undefined)
    }
  }, [isMobile, availableChatModels.length])

  const triggerButton = (
    <Button
      data-testid="model-selector"
      variant="ghost"
      className={cn(
        "w-fit px-1.5 py-4 gap-2 h-8 text-sm bg-transparent focus:border-disabled",
        className
      )}
      onMouseDown={(e) => e.preventDefault()}
      disabled={disabled}
    >
      <div className="flex items-center gap-2">
        {selectedChatModel?.icon && (
          <Image
            src={selectedChatModel.icon}
            alt={`${selectedChatModel.name} icon`}
            width={18}
            height={18}
            className="h-4 w-4 rounded-sm"
          />
        )}
        <span className="truncate max-w-[140px] font-medium">
          {selectedChatModel ? selectedChatModel.name : "Select Model"}
        </span>
      </div>
      <ChevronDown size={14} />
    </Button>
  )

  const modelListContent = (
    <div className={cn("p-2 max-h-[calc(100%-40px)] overflow-y-auto rounded-xl divide-y-0")}>
      <div className="px-2 py-1.5 text-[13px] font-medium text-muted-foreground/80 tracking-wide">
        Available Models
      </div>
      {availableChatModels.map((chatModel) => {
        const { id, name, icon, description } = chatModel
        const isSelected = id === optimisticModelId

        return (
          <div
            key={id}
            data-testid={`model-selector-item-${id}`}
            onClick={() => handleModelSelect(id)}
            className={cn(
              "flex items-center text- gap-2.5 px-2 py-2.5 cursor-pointer rounded-lg",
              "hover:bg-accent/30 focus:bg-accent/40 transition-all duration-200 ease-out",
              isSelected && "bg-accent/40 shadow-sm"
            )}
          >

            <div className="flex flex-col">
              <span className="text-sm font-apple text-foreground flex items-center gap-2">
                {name}
                {/* Reasoning Tag */}
                {hasReasoningTag(chatModel) && (
                  <span className="flex rounded-sm text-[13px] font-medium bg-gradient-to-r from-red-600 via-pink-500 to-rose-400 text-transparent bg-clip-text">
                    <div>Reasoning</div>
                  </span>
                )}
                {/* Coming Tag */}
                {hasComingTag(chatModel) && (
                  <span className="flex rounded-sm text-[13px] font-medium bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-400 text-transparent bg-clip-text">
                    <div>Coming</div>
                  </span>
                )}
                {/* New Tag */}
                {hasNewTag(chatModel) && (
                  <span className="flex rounded-sm text-[13px] font-medium bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400 text-transparent bg-clip-text">
                    <div>New</div>
                  </span>
                )}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{triggerButton}</SheetTrigger>
        <SheetContent
          side="bottom"
          style={sheetHeight ? { height: sheetHeight } : undefined}
          // Larger rounded top corners for mobile and remove internal padding so list can control spacing
          className={cn(
            "overflow-hidden rounded-t-3xl p-0",
            "shadow-model-selector dark:shadow-dark-model-selector" // <-- Shadow added here
          )}
        >
          {/* Header: keep spacing but remove any border so the list appears seamless */}
          <SheetHeader className="px-4 py-3 border-none">
            <SheetTitle className="text-sm font-medium">Select Model</SheetTitle>
          </SheetHeader>
          {/* Model list: ensure no dividing borders and give items space for icon, name and description */}
          <div className={cn("p-1 max-h-[calc(100%-40px)] overflow-y-auto rounded-b-3xl bg-secondary-background-token custom-scrollbar")}
          style={{ height: sheetHeight ? `calc(${sheetHeight} - 52px)` : undefined }}>
            <div className="px-3 py-2 text-[13px] font-medium text-muted-foreground/80 tracking-wide">
              Available Models
            </div>
            <div className="flex flex-col gap-1 px-2 pb-4">
              {availableChatModels.map((chatModel) => {
                const { id, name, icon, description } = chatModel
                const isSelected = id === optimisticModelId

                return (
                  <button
                    key={id}
                    data-testid={`model-selector-item-${id}`}
                    onClick={() => handleModelSelect(id)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-3 text-left rounded-lg",
                      "hover:bg-accent/20 focus:bg-accent/30 transition-all duration-150 ease-out",
                      isSelected && "bg-accent/40 shadow-sm"
                    )}
                  >
                    {icon ? (
                      <Image src={icon} alt={`${name} icon`} width={36} height={36} className="h-9 w-9 rounded-sm flex-shrink-0" />
                    ) : (
                      <div className="h-9 w-9 rounded-sm bg-muted-foreground/10 flex items-center justify-center text-sm text-muted-foreground">?
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground flex items-center gap-2">
                        {name}
                        {hasReasoningTag(chatModel) && (
                          <span className="text-[12px] font-medium text-pink-500">Reasoning</span>
                        )}
                        {hasComingTag(chatModel) && (
                          <span className="text-[12px] font-medium text-orange-500">Coming</span>
                        )}
                        {hasNewTag(chatModel) && (
                          <span className="text-[12px] font-medium text-green-600">New</span>
                        )}
                      </div>
                      {description && (
                        <div className="mt-1 text-[13px] text-muted-foreground line-clamp-2">{description}</div>
                      )}
                    </div>

                    {/* selection indicator */}
                    <div className="ml-2 mt-1">
                      {isSelected ? (
                        <div className="h-5 w-5 rounded-full bg-primary" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-snippet-border-token" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(
          "max-h-[340px] overflow-y-auto custom-scrollbar p-0 bg-secondary-background-token rounded-xl", // Removed shadow-lg
          "min-w-[260px] backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-200",
          "shadow-model-selector dark:shadow-dark-model-selector" // <-- Shadow added here
        )}
      >
        {modelListContent}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
