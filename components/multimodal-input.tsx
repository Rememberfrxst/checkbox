'use client';

import type { Attachment, UIMessage } from "ai";
// classNames helper is available as `cn` below; remove duplicate import
import type React from "react";
import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import { ArrowUpIcon, AttachmentIcon2, StopIcon, PaperclipIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import ThinkButton from "./ThinkButton";
import equal from "fast-deep-equal";
import type { UseChatHelpers } from "@ai-sdk/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownIcon } from "lucide-react";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import type { VisibilityType } from "./visibility-selector";
import type { Session } from "next-auth";
import { cn } from "@/lib/utils"; // Ensure cn is imported
import styles from "./multimodal-input-shadow.module.css";
import { WebSearchButton } from "./web-search-button";
import { ImprovePromptButton } from "./improve-prompt-button";
import SpeechButton from "./speech-button";

// Utility function for UUID
const generateUUID = () => crypto.randomUUID();

// --- MODIFIED: Array of interesting greetings with developer and common user queries ---
const interestingGreetings = [
  "How can I help you today?",
  "What's on your mind?",
  "Ready to chat! What can I do for you?",
  "Hello there! How may I assist you?",
  "Ask me anything!",
  "Let's explore something new.",
  "I'm here to help. What's your question?",
  "What's cooking?",
  "Got a question? I've got answers!",
  "Your AI assistant is ready. What's next?",
  "Feeling curious? Let's dive in!",
  "What's the big idea?",
  "Ready for a breakthrough? Ask away!",
  "I'm all ears (and algorithms)! What's up?",
  "Let's make some magic. What do you need?",
  "Your wish is my command. (Almost!) What can I do?",
  "Hi! How can I be useful right now?",
  "What's the challenge today?",
  "Let's get started. What's your query?",
  "I'm listening... What's your question?",
  // --- Developer-focused greetings ---
  "Need help debugging that tricky bug?",
  "Let's refactor some code!",
  "Got a coding challenge for me?",
  "What's the latest in web dev?",
  "Ready to brainstorm your next project?",
  "How can I optimize your workflow?",
  "Let's talk about algorithms and data structures.",
  "Stuck on a technical problem? I'm here.",
  "What framework are we building with today?",
  "Time to write some clean code!",
  // --- Common user queries / engaging prompts ---
  "Summarize this for me.",
  "Tell me a fun fact!",
  "Help me plan my day.",
  "Give me some creative ideas.",
  "Explain a complex topic simply.",
  "What's new in AI?",
  "Let's learn something together.",
  "Inspire me with a new idea.",
  "What's the best way to...?",
  "Can you generate some code for me?",
  "What's the current trend in tech?",
  "How do I get started with Next.js?",
  "Explain this concept in JavaScript.",
  "What are the best practices for React?",
];
// --- END MODIFIED ---

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
  selectedVisibilityType,
  session,
  selectedModelId,
  onModelChange,
  onWebSearch,
}: {
  chatId: string;
  input: UseChatHelpers["input"];
  setInput: UseChatHelpers["setInput"];
  status: UseChatHelpers["status"];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers["setMessages"];
  append: UseChatHelpers["append"];
  handleSubmit: UseChatHelpers["handleSubmit"];
  className?: string;
  selectedVisibilityType: VisibilityType;
  session: Session | null;
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
  onWebSearch?: (results: any[]) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  // Key for storing unsent input per chat so switching models or refresh doesn't clear it
  const unsentKey = `unsentInput:${chatId}`;
  // persistent localStorage key per chat (survives full page refresh)
  const perChatLocalKey = `box:unsent:${chatId}`;

  // Track model changes to avoid running initial animations when only the model changes.
  const prevSelectedModelIdRef = useRef<string | null>(selectedModelId);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  const isModelSwitch = hasMounted && prevSelectedModelIdRef.current !== selectedModelId;
  useEffect(() => {
    prevSelectedModelIdRef.current = selectedModelId;
  }, [selectedModelId]);

  // Fallback for undefined messages
  const safeMessages = messages || [];

  // Check if this is a new/empty chat
  const isEmptyChat = safeMessages.length === 0;

  // --- MODIFIED: State for dynamic greeting ---
  const [currentGreeting, setCurrentGreeting] = useState("");

  useEffect(() => {
    // Select a random greeting only once when the component mounts
    const randomIndex = Math.floor(Math.random() * interestingGreetings.length);
    setCurrentGreeting(interestingGreetings[randomIndex]);
  }, []); // Empty dependency array ensures this runs only on mount
  // --- END MODIFIED ---

  // Clear input when the user switches to a different chat and the new chat is empty.
  // Do NOT clear on model switches or refreshes.
  const prevChatIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!chatId) return;
    if (prevChatIdRef.current !== chatId && safeMessages.length === 0) {
      setInput("");
      try {
        sessionStorage.removeItem(`unsentInput:${chatId}`);
        localStorage.removeItem(perChatLocalKey);
      } catch (e) {
        // ignore
      }
      if (textareaRef.current) textareaRef.current.value = "";
    }
    prevChatIdRef.current = chatId;
  }, [chatId, safeMessages.length, setInput, perChatLocalKey]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [input, attachments.length]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + (attachments.length * 82)}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = "104px";
    }
  };

  // Sync localStorage with input
  const [localStorageInput, setLocalStorageInput] = useLocalStorage("input", "");

  useLayoutEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      const finalValue = domValue || localStorageInput || "";
      setInput(finalValue);
      adjustHeight();
    }
  }, [setInput, localStorageInput]);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  // Autosave unsent input to sessionStorage so model switches or UI changes don't clear it
  useEffect(() => {
    try {
      sessionStorage.setItem(unsentKey, input || "");
    } catch (e) {
      // ignore
    }
  }, [input, unsentKey]);

  // Restore input when model changes (don't clear on model switch)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(unsentKey) || "";
      if (saved && saved !== input) {
        setInput(saved);
        if (textareaRef.current) textareaRef.current.value = saved;
      }
    } catch (e) {
      // ignore
    }
    // we intentionally depend on selectedModelId so this runs when model changes
  }, [selectedModelId]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    window.history.replaceState({}, "", `/chat/${chatId}`);

    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });
    setAttachments([]);
    setLocalStorageInput("");
    resetHeight();
    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [attachments, handleSubmit, setAttachments, setLocalStorageInput, width, chatId]);



  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;
        return { url, name: pathname, contentType };
      }

      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error("Failed to upload file, please try again!");
    }
  };

  // Allow pasting images (Ctrl+V) into the textarea and handle dropped files
  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.type && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      setUploadQueue((q) => [...q, ...imageFiles.map((f) => f.name)]);
      try {
        const uploads = await Promise.all(imageFiles.map((f) => uploadFile(f)));
        const successes = uploads.filter((u) => u !== undefined) as any[];
        setAttachments((curr) => [...curr, ...successes]);
      } catch (err) {
        console.error("Failed to upload pasted images", err);
      } finally {
        setUploadQueue([]);
      }
    }
  }, [setAttachments, uploadFile]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length === 0) return;

    setUploadQueue(files.map((f) => f.name));
    try {
      const uploads = await Promise.all(files.map((f) => uploadFile(f)));
      const successes = uploads.filter((u) => u !== undefined) as any[];
      setAttachments((curr) => [...curr, ...successes]);
    } catch (err) {
      console.error("Failed to upload dropped files", err);
    } finally {
      setUploadQueue([]);
    }
  }, [setAttachments, uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter((attachment) => attachment !== undefined);
        setAttachments((currentAttachments) => [...currentAttachments, ...successfullyUploadedAttachments]);
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  useEffect(() => {
    if (status === "submitted") {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  if (!chatId) {
    return <div>Error: Chat ID is required</div>;
  }

  return (
    <>
      {/* Centered Layout for Empty Chat */}
      {isEmptyChat && (
        <div className="flex flex-col items-center min-h-[42vh] w-full">
          <div className="w-full max-w-3xl">
            {/* Chat Title - MODIFIED for stability */}
            <div className="flex items-center justify-center h-16 mb-4"> {/* Fixed height container */}
              <h1
                className="text-ellipsis font-[400] overflow-hidden text-[rgba(6, 182, 212, 0.2)] dark:text-[rgba(0, 255, 255, 0.2)] text-center"
                style={{
                  fontSize: "28px",
                  // minHeight, alignItems, justifyContent removed as parent div handles it
                }}
              >
                {currentGreeting} {/* Using dynamic greeting */}
              </h1>
            </div>
            {/* Centered Input Container */}
              <CenteredInputForm
                textareaRef={textareaRef}
                input={input}
                setInput={setInput}
                handleInput={handleInput}
                safeMessages={safeMessages}
                className={className}
                submitForm={submitForm}
                status={status}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                attachments={attachments}
                uploadQueue={uploadQueue}
                stop={stop}
                setMessages={setMessages}
                session={session}
                selectedModelId={selectedModelId}
                onModelChange={onModelChange}
                handlePaste={handlePaste}
                handleDrop={handleDrop}
                handleDragOver={handleDragOver}
                /* web search removed */
              />
          </div>
        </div>
      )}

      {/* Bottom Layout for Active Chat */}
      {!isEmptyChat && (
        <motion.div
          initial={isModelSwitch ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-full flex flex-col gap-4"
        >
          <AnimatePresence>
            <div className="absolute right-1.5">
              {!isAtBottom && (
                <motion.div
                  initial={isModelSwitch ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative bottom-14 bg-transparent -translate-x-1/2 z-50"
                >
                  <Button
                    data-testid="scroll-to-bottom-button"
                    className="rounded-full bg-muted h-8 w-8"
                    size="icon"
                    variant="outline"
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToBottom();
                    }}
                  >
                    <ArrowDownIcon size={16} />
                  </Button>
                </motion.div>
              )}
            </div>
          </AnimatePresence>

          <input
            type="file"
            className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
            ref={fileInputRef}
            multiple
            onChange={handleFileChange}
            tabIndex={-1}
          />

          {(attachments?.length > 0 || uploadQueue.length > 0) && (
            <div data-testid="attachments-preview" className="flex flex-row gap-2 overflow-x-scroll items-end border">
              {attachments?.map((attachment) => (
                <PreviewAttachment key={attachment.url} attachment={attachment} />
              ))}
              {uploadQueue.map((filename) => (
                <PreviewAttachment
                  key={filename}
                  attachment={{ url: "", name: filename, contentType: "" }}
                  isUploading={true}
                />
              ))}
            </div>
          )}

          <BottomInputForm
            textareaRef={textareaRef}
            input={input}
            setInput={setInput}
            handleInput={handleInput}
            safeMessages={safeMessages}
            className={className}
            submitForm={submitForm}
            status={status}
            fileInputRef={fileInputRef}
            attachments={attachments}
            uploadQueue={uploadQueue}
            stop={stop}
            setMessages={setMessages}
            session={session}
            selectedModelId={selectedModelId}
            onModelChange={onModelChange}
            handlePaste={handlePaste}
            handleDrop={handleDrop}
            handleDragOver={handleDragOver}
                /* web search removed */
          />
        </motion.div>
      )}
    </>
  );
}

// Centered Input Form Component (without animated placeholder)
function CenteredInputForm({
  textareaRef,
  input,
  setInput,
  handleInput,
  safeMessages,
  className,
  submitForm,
  status,
  fileInputRef,
  handleFileChange,
  attachments,
  uploadQueue,
  stop,
  setMessages,
  session,
  selectedModelId,
  onModelChange,
  onWebSearch,
  handlePaste,
  handleDrop,
  handleDragOver,
}: any) {
  const handleInputFocus = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    textareaRef.current?.focus();
  }, []);

  // use inline hook call for box-shadow (kept consistent with BottomInputForm)

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (status !== "ready") {
        toast.error("Please wait for the model to finish its response!");
      } else if (input.trim()) {
        submitForm();
      }
    }
  }, [status, input, submitForm]);

  return (
    <div className="w-full">
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      <div
          className={cn(
            "flex w-full flex-col rounded-[1.75rem] bg-muted border overflow-hidde cursor-text",
            styles.mmInputShadowHighlight,
            "_77cefa5 _9996a53",
          )}
        onClick={handleInputFocus}
        onTouchStart={handleInputFocus}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {(attachments?.length > 0 || uploadQueue.length > 0) && (
          <div className="p-2 flex flex-row gap-2 overflow-x-auto items-end border-b-[2.5px]">
            {attachments?.map((attachment: any) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
            {uploadQueue.map((filename: string) => (
              <PreviewAttachment
                key={filename}
                attachment={{ url: "", name: filename, contentType: "" }}
                isUploading={true}
              />
            ))}
          </div>
        )}

        <div className="flex w-full flex-col">
          <div className="relative text-base px-[1.32rem]">
            <Textarea
              data-testid="multimodal-input"
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onPaste={handlePaste}
              onDrop={(e) => e.preventDefault()}
              className={cn(
                "w-full h-full flex resize-none cursor-text focus:ring-0 focus:border-0",
                className,
              )}
              rows={1}
              autoFocus
              placeholder="Ask anything"
              onKeyDown={handleKeyDown}
              // Avoid inline styles that may conflict with global CSS. Keep background transparent via classes.
              style={{ backgroundColor: 'transparent' }}
            />
          </div>
        </div>
        <div className="flex justify-between items-center rounded-b-[1.75rem] p-2.5">
          <div className="flex items-center gap-1.5 p-1 -m-1">
          {/* Updated AttachmentsButton usage */}
          <div>
            <AttachmentsButton fileInputRef={fileInputRef} status={status} hasAttachments={attachments.length > 0} />
          </div>
          <div>
            <ThinkButton
               selectedModelId={selectedModelId}
               onModelChange={onModelChange!}
               onThinkModeToggle={(isThinking) => {
                 if (typeof window !== 'undefined') {
                   if (isThinking) {
                     sessionStorage.setItem('thinkingMode', 'true');
                   } else {
                     sessionStorage.removeItem('thinkingMode');
                   }
                 }
               }}
             />
           </div>
            <div>
             <WebSearchButton
               onClick={() => onWebSearch?.([])}
               status={status}
             />
             </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ImprovePromptButton
              input={input}
              status={status}
              onImprovedPrompt={(improved) => {
                setInput?.(improved);
                if (textareaRef?.current) {
                  textareaRef.current.value = improved;
                  textareaRef.current.focus();
                }
              }}
            />
            {/* When streaming (status === 'submitted'), show only Stop. Otherwise show Send if input exists, else Speech */}
            {status === "submitted" ? (
              <StopButton stop={stop} setMessages={setMessages} />
            ) : input?.trim().length ? (
              <SendButton input={input} submitForm={submitForm} uploadQueue={uploadQueue} />
            ) : (
              <SpeechButton />
            )}
          </div>
        </div>
      </div>
      <InputStyles />
    </div>
  );
}

// Bottom Input Form Component (for active chats)
function BottomInputForm({
  textareaRef,
  input,
  setInput,
  handleInput,
  safeMessages,
  className,
  submitForm,
  status,
  fileInputRef,
  attachments,
  uploadQueue,
  stop,
  setMessages,
  session,
  selectedModelId,
  onModelChange,
  onWebSearch,
  handlePaste,
  handleDrop,
  handleDragOver,
}: any) {
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (status !== "ready") {
        toast.error("Please wait for the model to finish its response!");
      } else if (input.trim()) {
        submitForm();
      }
    }
  }, [status, input, submitForm]);

  return (
    <div
      className={cn(
        "flex w-full flex-col grow rounded-[1.75rem] bg-muted border overflow-x-auto cursor-text",
        styles.mmInputShadowHighlight,
        "_77cefa5 _3d616d3",
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {(attachments?.length > 0 || uploadQueue.length > 0) && (
        <div className="p-2 flex flex-row gap-2 overflow-x-auto items-end">
          {attachments?.map((attachment: any) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}
          {uploadQueue.map((filename: string) => (
            <PreviewAttachment
              key={filename}
              attachment={{ url: "", name: filename, contentType: "" }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <div className="flex w-full flex-col">
          <div className="relative text-base px-5">
          <Textarea
            data-testid="multimodal-input"
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onPaste={handlePaste}
            onDrop={(e) => e.preventDefault()}
              className={cn(
                "w-full h-full flex resize-none cursor-text focus:ring-0 focus:border-0",
                className,
              )}
            rows={1}
            autoFocus
            placeholder="Ask anything"
            onKeyDown={handleKeyDown}
            style={{ paddingLeft: '', backgroundColor: 'transparent !important' }}
          />
        </div>
      </div>

      
    <div className="flex w-full pt-14 cursor-auto gap-1">
      <div className="absolute bottom-0 p-2.5 w-full rounded-b-[1.75rem] flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 p-1 -m-1">
         <AttachmentsButton fileInputRef={fileInputRef} status={status} hasAttachments={attachments.length > 0} />
            <ThinkButton
               selectedModelId={selectedModelId}
               onModelChange={onModelChange!}
               onThinkModeToggle={(isThinking) => {
                 if (typeof window !== 'undefined') {
                   if (isThinking) {
                     sessionStorage.setItem('thinkingMode', 'true');
                   } else {
                     sessionStorage.removeItem('thinkingMode');
                   }
                 }
               }}
             />
             <WebSearchButton
               onClick={() => onWebSearch?.([])}
               status={status}
             />
          </div>
          <div className="flex items-center px-0.5 gap-2">
            <ImprovePromptButton
              input={input}
              status={status}
              onImprovedPrompt={(improved) => {
                setInput?.(improved);
                if (textareaRef?.current) {
                  textareaRef.current.value = improved;
                  textareaRef.current.focus();
                }
              }}
            />
            {status === "submitted" ? (
              <StopButton stop={stop} setMessages={setMessages} />
            ) : input?.trim().length ? (
              <SendButton input={input} submitForm={submitForm} uploadQueue={uploadQueue} />
            ) : (
              <SpeechButton />
            )}
          </div>
        </div>
      </div>
      <InputStyles />
    </div>
  );
}

// Original Input Styles Component (without animated placeholder styles)
function InputStyles() {
  return (
    <style jsx>{`
      [data-testid="multimodal-input"] {
        white-space: pre-wrap;
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: #d1d5db transparent;
        display: block !important;
        visibility: visible !important;
        font-size: clamp(12px, 2vw, 14px);
      }

      [data-testid="multimodal-input"]::-webkit-scrollbar {
        height: 6px;
      }

      [data-testid="multimodal-input"]::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 3px;
      }

      [data-testid="multimodal-input"]::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }

      [data-testid="multimodal-input"]::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }

      [data-testid="multimodal-input"]:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
      }

      [data-testid="multimodal-input"]:hover {
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
      }

      /* Removed old attachments-button styles as they are now handled by the new structure */
      /*
      [data-testid="attachments-button"] {
        transition: transform 0.2s ease, background-color 0.2s ease;
      }

      [data-testid="attachments-button"]:hover:not(:disabled) {
        transform: scale(1.1);
        background-color: rgba(59, 130, 246, 0.1);
      }
      */

      @media (prefers-color-scheme: dark) {
        [data-testid="multimodal-input"]::placeholder {
          text-shadow: 0 0 8px rgba(96, 165, 250, 0.4);
          color: #999;
        }

        [data-testid="multimodal-input"] {
          scrollbar-color: #6b7280 transparent;
          caret-color: #60a5fa;
        }

        [data-testid="multimodal-input"]::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 3px;
        }

        [data-testid="multimodal-input"]::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 3px;
        }

        [data-testid="multimodal-input"]::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      }
    `}</style>
  );
}

export const MultimodalInput = memo(PureMultimodalInput, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.status !== nextProps.status) return false;
  if (!equal(prevProps.attachments, nextProps.attachments)) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) return false;
  if (prevProps.selectedModelId !== nextProps.selectedModelId) return false;
  return true;
});

// New interface for AttachmentsButton props
interface AttachmentsButtonProps {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers["status"];
  hasAttachments: boolean; // Added to indicate if files are already attached
}

function PureAttachmentsButton({
  fileInputRef,
  status,
  hasAttachments,
}: AttachmentsButtonProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  }, [fileInputRef]);

  const isDisabled = status !== "ready";

  return (
    <span className="inline-block" data-state={hasAttachments ? 'open' : 'closed'}>
      <div
        className={cn(
          "inline-flex h-9 rounded-full border text-[13px] font-semibold text-token-text-secondary border-token-border-default focus-visible:outline-black dark:focus-visible:outline-white",
          {
            // Apply active styling if attachments are present
            "radix-state-open:bg-black/10 bg-blue-50 text-blue-600 dark:text-blue-400 shadow-sm": hasAttachments,
            "hover:bg-token-main-surface-secondary": !hasAttachments, // Hover effect when not active
            "opacity-50 pointer-events-none": isDisabled, // Disabled state styling
          }
        )}
      >
        <button
          className="flex h-full min-w-8 items-center justify-center p-2"
          data-testid="attachments-button"
          aria-pressed={hasAttachments ? 'true' : 'false'}
          aria-label="Attach files"
          aria-disabled={isDisabled}
          onClick={handleClick}
          disabled={isDisabled}
        >
          <PaperclipIcon size={20} /> {/* Icon for attachments */}
        </button>
      </div>
    </span>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton, (prevProps, nextProps) => {
  // Memoization check for relevant props
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.hasAttachments !== nextProps.hasAttachments) return false;
  return true;
});

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers["setMessages"];
}) {
  const onClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    stop();
    setMessages((messages) => messages);
  }, [stop, setMessages]);

  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-2 h-fit border dark:border-zinc-600"
      onClick={onClick}
      aria-label="Stop generation"
    >
      <StopIcon size={20} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  const isDisabled = input.length === 0 || uploadQueue.length > 0;

  const onClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDisabled) submitForm();
  }, [isDisabled, submitForm]);

  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-2 h-fit dark:border-zinc-600 disabled:opacity-50"
      onClick={onClick}
      disabled={isDisabled}
      aria-label="Send message"
      aria-disabled={isDisabled}
    >
      <ArrowUpIcon size={20} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  // Re-render when input or upload queue length changes
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length) return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
