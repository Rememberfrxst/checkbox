"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import hljs from "highlight.js"
import { useArtifact } from "@/hooks/use-artifact"
import { CopyIcon1, PencilHeartIcon, CollapseIcon, ExpandIcon } from "./icons"

// C/C++-inspired theme styles with dark background (unchanged)
const codeThemeStylesDark = `
  .hljs {
    color: #fff !important;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', Consolas, 'Courier New', monospace !important;
    font-size: 13px !important;
    line-height: 1.6 !important;
    letter-spacing: 0.025em !important;
    background-image: none !important;
    background-attachment: initial !important;
    background-size: initial !important;
    background-repeat: no-repeat !important;
  }
  
  /* Comments - Green and Italic */
  .hljs-comment,
  .hljs-quote {
    color: #ffffff80 !important;

  }
  
  /* Keywords - Blue */
  .hljs-literal,
  .hljs-doctag,
  .hljs-title,
  .hljs-section,
  .hljs-strong {
    color: #569CD6 !important;
  }

  .hljs-name,
  .hljs-selector-tag {
    color: #e9950c !important;
    }
  
  /* C/C++ specific keywords - Blue */
  .language-cpp .hljs-keyword,
  .language-c .hljs-keyword,
  .language-cpp .hljs-built_in,
  .language-c .hljs-built_in {
    color: #569CD6 !important;
  }
  
  /* Types - Cyan */
  .hljs-type,
  .hljs-class .hljs-title,
  .hljs-title.class_,
  .hljs-title.class_.inherited__,
  .hljs-built_in {
    color: #df3079 !important;
  }
  
  /* C/C++ specific types - Cyan */
  .language-cpp .hljs-type,
  .language-c .hljs-type,
  .language-cpp .hljs-title.class_,
  .language-c .hljs-title.class_ {
    color: #f22c3d !important;
  }
  
  /* Functions and Methods - Light Yellow */
  .hljs-function .hljs-title,
  .hljs-title.function_,
  .hljs-title.function_.invoke__,
  .hljs-function,
  .hljs-function-name {
    color: #f22c3d !important;
  }
  
  /* Strings - Light Orange */
  .hljs-string,
  .hljs-meta-string,
  .hljs-regexp,
  .hljs-template-string {
    color: #00a67d !important;
  }
  
  .hljs-text {}
  
  /* Numbers and Constants - Light Purple */
  
  .hljs-literal,
  .hljs-constant {
    color: #B5CEA8 !important;
  }
  
  /* Preprocessor Directives - Purple */
  .hljs-meta-keyword,
  .hljs-preprocessor {
    color: #569CD6 !important;
  }

  .hljs-meta,
  .hljs-keyword, {
    color: #ffffff99 !important;
    }
  
  /* C/C++ specific preprocessor - Purple */
  .language-cpp .hljs-meta,
  .language-c .hljs-meta,
  .language-cpp .hljs-meta-keyword,
  .language-c .hljs-meta-keyword {
    color: #ffffff !important;
  }
  
  /* Variables and Properties - Default Light Gray */
  .hljs-attr,
  .hljs-variable,

  .hljs-template-variable,
  .hljs-property,
  .hljs-number,
  .hljs-attribute {
    color: #df3079 !important;
  }
  
  /* Operators - Light Gray */
  .hljs-operator,
  .hljs-punctuation {
    color: #D4D4D4 !important;
  }
  
  /* Tags - Blue */
  
  .hljs-selector-id,
  .hljs-selector-class,
  .hljs-selector-attr,
  .hljs-selector-pseudo {
    color: #569CD6 !important;
  }

  .hljs-tag{
    color: #fff !important;
  }
  
  /* Parameters - Light Gray */
  .hljs-params {
    color: #D4D4D4 !important;
  }
  
  /* CSS Specific Styles */

  .language-css .hljs-selector-id {
    color: #569CD6 !important;
  }

    .language-css .hljs-selector-class{
    color: #f22c3d !important; 
    }
  


  .language-css .hljs-attribute {
    color: #df3079 !important;
  }
  
  .language-css .hljs-number {
    color: #B5CEA8 !important;
  }
  
  .language-css .hljs-string {
    color: #00a67d!important;
  }
  
  .language-css .hljs-built_in {
    color: #f22c3d !important;
  }
  
  /* Bash/Terminal Specific Styles */
  .language-bash .hljs-built_in,
  .language-sh .hljs-built_in,
  .language-shell .hljs-built_in,
  .language-bash .hljs-string,
  .language-sh .hljs-string,
  .language-shell .hljs-string,
  .language-bash .hljs-variable,
  .language-sh .hljs-variable,
  .language-shell .hljs-variable,
  .language-bash,
  .language-sh,
  .language-shell {
    color: #fff !important;
  }
  
  /* Output/Terminal styling */
  .hljs-output {
    color: #4EC9B0 !important;
  }
  
  /* Special highlighting */
  .hljs-addition {
    color: #6A9955 !important;
    background-color: #1F2937 !important;
  }
  
  .hljs-deletion {
    color: #F14C4C !important;
    background-color: #1F2937 !important;
  }
  
  .hljs-emphasis {
    font-style: italic !important;
  }
  
  .hljs-link {
    text-decoration: underline !important;
    color: #4EC9B0 !important;
  }
  
  .hljs-subst {
    color: #D4D4D4 !important;
  }
  
  .hljs-symbol,
  .hljs-bullet {
    color: #4EC9B0 !important;
  }
  
  .hljs-formula {
    color: #DCDCAA !important;
  }
  
  /* JavaScript specific */
  .language-javascript .hljs-title.function_,
  .language-js .hljs-title.function_ {
    color: #DCDCAA !important;
  }
  
  .language-javascript .hljs-variable.language_,
  .language-js .hljs-variable.language_ {
    color: #569CD6 !important;
  }
  
  /* Python specific */
  .language-python .hljs-built_in {
    color: #4EC9B0 !important;
  }
  
  .language-python .hljs-keyword {
    color: #569CD6 !important;
  }

  .code-form {
    font-family: 'Poppins', sans-serif;
  }

  /* Firefox scrollbar */
  .hljs,
  pre {
    scrollbar-width: thin;
    scrollbar-color: #2f2f2f transparent;
  }
`

// Complete light mode styles with proper syntax highlighting
const codeThemeStylesLight = `
  .hljs {
    color: #1E1E1E !important;
    background: transparent !important;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', Consolas, 'Courier New', monospace !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
    letter-spacing: 0.025em !important;
  }
  
  /* Comments - Gray */
  .hljs-comment,
  .hljs-quote {
    color: #6A737D !important;
    font-style: italic !important;
  }
  
  /* Keywords - Blue */
  .hljs-keyword,
  .hljs-selector-tag,
  .hljs-literal,
  .hljs-doctag,
  .hljs-title,
  .hljs-section,
  .hljs-name,
  .hljs-strong {
    color: #0066CC !important;
  }
  
  /* Types - Purple */
  .hljs-type,
  .hljs-class .hljs-title,
  .hljs-title.class_,
  .hljs-title.class_.inherited__,
  .hljs-built_in {
    color: #7C3AED !important;
  }
  
  /* Functions - Dark Orange */
  .hljs-function .hljs-title,
  .hljs-title.function_,
  .hljs-title.function_.invoke__,
  .hljs-function,
  .hljs-function-name {
    color: #D97706 !important;
  }
  
  /* Strings - Green */
  .hljs-string,
  .hljs-meta-string,
  .hljs-regexp,
  .hljs-template-string {
    color: #16A34A !important;
  }
  
  /* Numbers - Purple */
  .hljs-number,
  .hljs-literal,
  .hljs-constant {
    color: #7C2D12 !important;
  }
  
  /* Variables - Dark Red */
  .hljs-attr,
  .hljs-variable,
  .hljs-template-variable,
  .hljs-property,
  .hljs-attribute {
    color: #DC2626 !important;
  }
  
  /* Output */
  .hljs-output {
    color: #059669 !important;
  }
  
  /* Scrollbar for light mode */
  .hljs,
  pre {
    scrollbar-color: #D4D4D4 transparent;
  }
`

interface CodeBlockProps {
  node?: any
  inline?: boolean
  className?: string
  children: React.ReactNode
  isOutput?: boolean
  onEdit?: (newCode: string) => void
}

export function CodeBlock({
  node,
  inline = false,
  className = "",
  children,
  isOutput = false,
  onEdit,
  ...props
}: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null)
  const { setArtifact } = useArtifact()
  const [isCopied, setIsCopied] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark") // Default to dark

  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    setTheme(mediaQuery.matches ? "dark" : "light")

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light")
    }
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Inject theme styles based on detected theme
  useEffect(() => {
    const styleId = "cpp-theme"
    const existingStyle = document.getElementById(styleId)
    if (existingStyle) existingStyle.remove()

    const style = document.createElement("style")
    style.id = styleId
    style.textContent = theme === "dark" ? codeThemeStylesDark : codeThemeStylesLight
    document.head.appendChild(style)
  }, [theme])

  const isCodeBlock = className.includes("language-") || isOutput
  const languageMatch = className.match(/language-(\w+)/)
  const isBashOutput =
    className.includes("language-bash") ||
    className.includes("language-sh") ||
    className.includes("language-shell") ||
    isOutput

  const language = isOutput
    ? "Output"
    : languageMatch
      ? languageMatch[1].charAt(0).toUpperCase() + languageMatch[1].slice(1)
      : "Code"

  const codeContent = typeof children === "string" ? children : String(children)

  useEffect(() => {
    if (codeRef.current && isCodeBlock) {
      codeRef.current.className = `${className || "language-plaintext"} hljs`
      codeRef.current.removeAttribute("data-highlighted")
      try {
        if (!className.includes("language-") && !isOutput) {
          const result = hljs.highlightAuto(codeContent)
          codeRef.current.innerHTML = result.value
          codeRef.current.className = `language-${result.language || "plaintext"} hljs`
        } else if (isOutput) {
          codeRef.current.className = "hljs-output hljs"
          codeRef.current.textContent = codeContent
        } else {
          hljs.highlightElement(codeRef.current)
        }
      } catch (error) {
        console.error("Highlight.js error:", error)
        codeRef.current.textContent = codeContent
      }
    }
  }, [children, className, isCodeBlock, isOutput, codeContent])

  const handleCopy = async () => {
    const textToCopy = codeRef.current?.textContent || codeContent
    try {
      await navigator.clipboard.writeText(textToCopy)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  const handleCollapse = () => setIsCollapsed(!isCollapsed)

  const handleEdit = () => {
    const codeText = codeRef.current?.textContent || codeContent
    setArtifact({
      documentId: "init",
      title: `${language} Snippet`,
      kind: "code",
      content: codeText,
      isVisible: true,
      status: "idle",
      boundingBox: {
        top: window.scrollY + 100,
        left: window.innerWidth > 640 ? 100 : 20,
        width: window.innerWidth > 640 ? 600 : window.innerWidth - 40,
        height: 400,
      },
    })
  }

  if (!isCodeBlock) {
    return <span>{children}</span>
  }

  if (inline) {
    return (
      <code
        ref={codeRef}
        className={`${className || "language-plaintext"} inline-block max-w-full break-words [overflow-wrap:anywhere] bg-snippet px-2 py-1 text-sm rounded`}
        {...props}
      >
        {children}
      </code>
    )
  }

  return (
    <pre className={`code-form w-full max-w-full sm:max-w-[48rem] mx-auto my-4 contain-inline-size rounded-2xl shadow-md bg-snippet `}>
      <div className={`flex items-center justify-between rounded-t-2xl font-apple px-2 bg-snippet`}>
        <div className="flex items-center mx-1 space-x-2">
          <span className="text-[11px] sm:text-[12px] font-apple truncate max-w-[120px] sm:max-w-none">{language}</span>
        </div>
        <div className="flex space-x-1 sm:space-x-2">
          <button
            onClick={handleCollapse}
            className={`flex items-center gap-1 rounded px-2 py-1 sm:px-2 sm:py-1 text-[10px] sm:text-[11px] min-h-[36px] sm:min-h-[32px] transition-all bg-snippet`}
          >
            {isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
            <span className="hidden sm:inline">{isCollapsed ? "Expand" : "Collapse"}</span>
          </button>

          {!isOutput && (
            <button
              onClick={handleEdit}
              className={`flex items-center gap-1 rounded px-2 py-1 sm:px-2 sm:py-1 text-[10px] sm:text-[11px] min-h-[36px] sm:min-h-[32px] transition-all bg-snippet`}
            >
              <PencilHeartIcon />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 rounded px-2 py-1 sm:px-2 sm:py-1 text-[10px] sm:text-[11px] min-h-[36px] sm:min-h-[32px] transition-all ${
              isCopied ? "bg-green-600 text-white" : theme === "light" ? "bg-snippet" : "bg-snippet"
            }`}
          >
            <CopyIcon1 />
            <span className="hidden sm:inline">{isCopied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>
      <div className={isCollapsed ? "hidden" : "block"}>
        <div className={`w-full max-w-full overflow-x-auto rounded-b-2xl text-sm font-inherit p-4 bg-snippet scrollbar scrollbar-track-transparent scrollbar-thumb-muted`}>
          <pre className="w-full max-w-full min-w-0 leading-relaxed">
            <code
              ref={codeRef}
              className={`block w-full max-w-full min-w-0 whitespace-pre-wrap break-words max-sm:break-all [overflow-wrap:anywhere] ${
                isOutput ? (theme === "light" ? "text-black" : "") : ""
              }`}
            >
              {children}
            </code>
          </pre>
        </div>
      </div>
    </pre>
  )
}
