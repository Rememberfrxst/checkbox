"use client"

import type { AppUsage } from "@/lib/usage";
import type { UIMessage } from "ai"
import { useChat } from "@ai-sdk/react"
import { useEffect, useState, useRef, useCallback } from "react" // Added useRef for scrolling
import useSWR, { useSWRConfig } from "swr"
import { DefaultChatTransport } from "ai";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChatHeader } from "@/components/chat-header"
import type { Vote } from "@/lib/db/schema"
import { fetcher, generateUUID, fetchWithErrorHandlers } from "@/lib/utils"
import { Artifact } from "./artifact"
import { MultimodalInput } from "./multimodal-input"
import { Messages } from "./messages"
import type { VisibilityType } from "./visibility-selector"
import { useArtifactSelector } from "@/hooks/use-artifact"
import { unstable_serialize } from "swr/infinite"
import { getChatHistoryPaginationKey } from "./sidebar-history"
import { toast } from "./toast"
import type { Session } from "next-auth"
import { useSearchParams } from "next/navigation"
import type { Attachment, ChatMessage } from "@/lib/types";
import { useChatVisibility } from "@/hooks/use-chat-visibility"
import { ChatSDKError } from "@/lib/errors";
import { useDataStream } from "./data-stream-provider";
import { useAutoResume } from "@/hooks/use-auto-resume";




// Define the props interface for the Chat component
interface ChatProps {
  id: string
  initialMessages: ChatMessage[];
  initialChatModel: string
  initialVisibilityType: VisibilityType
  isReadonly: boolean
  session: Session
  autoResume: boolean
  initialLastContext?: AppUsage;
}

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
  initialLastContext,
}: ChatProps) {

  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  })

  const { mutate } = useSWRConfig()
  const { setDataStream } = useDataStream();
  const [currentChatModel, setCurrentChatModel] = useState(initialChatModel)
  const [input, setInput] = useState<string>("");
  const [usage, setUsage] = useState<AppUsage | undefined>(initialLastContext);
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const currentModelIdRef = useRef(currentModelId);

    useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest(request) {
        return {
          body: {
            id: request.id,
            message: request.messages.at(-1),
            selectedChatModel: currentModelIdRef.current,
            selectedVisibilityType: visibilityType,
            ...request.body,
          },
        };
      },
    }),
    
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
      if (dataPart.type === "data-usage") {
        setUsage(dataPart.data);
      }
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        // Check if it's a credit card error
        if (
          error.message?.includes("AI Gateway requires a valid credit card")
        ) {
          setShowCreditCardAlert(true);
        } else {
          toast({
            type: "error",
            description: error.message,
          });
        }
      }
    },
  });
  // Auto-scroll to bottom during streaming/message updates
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  useEffect(() => {
    if (autoResume) {
      resumeStream()
    }
  }, [])


  const searchParams = useSearchParams()
  const query = searchParams.get("query")
  const [hasAppendedQuery, setHasAppendedQuery] = useState(false)


  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });
      setHasAppendedQuery(true)
      window.history.replaceState({}, "", `/chat/${id}`)
    }
  }, [query, sendMessage, hasAppendedQuery, id])

  const { data: votes } = useSWR<Array<Vote>>(messages.length >= 2 ? `/api/vote?chatId=${id}` : null, fetcher)
  const [attachments, setAttachments] = useState<Array<Attachment>>([])
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible)
  const handleModelChange = useCallback((newModelId: string) => {
    setCurrentChatModel(newModelId)
  }, [])


  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh overflow-hidden bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={currentChatModel}
          selectedVisibilityType={initialVisibilityType}
          isReadonly={isReadonly}
          session={session}
          onModelChange={handleModelChange}
        />


        {messages.length > 0 && (
          <Messages
            chatId={id}
            status={status}
            votes={votes}
            messages={messages}
            setMessages={setMessages}
            regenerate={regenerate}
            isReadonly={isReadonly}
            isArtifactVisible={isArtifactVisible}
          />

        )}
        <div ref={messagesEndRef} /> {/* Scroll anchor for streaming */}

        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center w-full px-4 pb-4 md:pb-6">
            <form className="flex mx-auto gap-2 w-full md:max-w-[50rem]">
              {!isReadonly && (
                <MultimodalInput
                  chatId={id}
                  input={input}
                  setInput={setInput}
                  sendMessage={sendMessage}
                  status={status}
                  stop={stop}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  messages={messages}
                  setMessages={setMessages}
                  selectedVisibilityType={visibilityType}
                  
                  session={session}
                  selectedModelId={currentChatModel}
                  onModelChange={handleModelChange}
                />
              )}
            </form>
          </div>
        ) : (
          <form className="flex mx-auto px-4 pb-4 md:pb-6 gap-2 w-full md:max-w-[50rem]">
            {!isReadonly && (
              <MultimodalInput
                chatId={id}
                input={input}
                setInput={setInput}
                sendMessage={sendMessage}
                status={status}
                stop={stop}
                attachments={attachments}
                setAttachments={setAttachments}
                messages={messages}
                setMessages={setMessages}
                selectedVisibilityType={visibilityType}
                session={session}
                selectedModelId={currentChatModel}
                onModelChange={handleModelChange}
                /* web search integration removed */
              />
            )}
          </form>
        )}
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        sendMessage={sendMessage}
        messages={messages}
        setMessages={setMessages}
        regenerate={regenerate}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
        session={session}
        selectedModelId={currentChatModel}
        onModelChange={handleModelChange}
      />
    </>
  )
}
