"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
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
  const codeRef = useRef<HTMLElement | null>(null)
  const gutterRef = useRef<HTMLDivElement | null>(null)
  const { setArtifact } = useArtifact()
  const [isCopied, setIsCopied] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isWrapped, setIsWrapped] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [lines, setLines] = useState<number>(0)
  const { theme: resolvedTheme } = useTheme()
  // next-themes can return 'system' - respect that; default to dark
  const theme = resolvedTheme === "light" ? "light" : "dark"

  // Inject theme styles based on detected theme (keeps syntax colors from earlier)
  useEffect(() => {
    const styleId = "cpp-theme-v2"
    const existingStyle = document.getElementById(styleId)
    if (existingStyle) existingStyle.remove()

    const style = document.createElement("style")
    style.id = styleId
    style.textContent = theme === "dark" ? codeThemeStylesDark : codeThemeStylesLight
    document.head.appendChild(style)
    return () => {
      const el = document.getElementById(styleId)
      if (el) el.remove()
    }
  }, [theme])

  const isCodeBlock = (className || "").includes("language-") || isOutput
  const languageMatch = (className || "").match(/language-(\w+)/)
  const isBashOutput =
    (className || "").includes("language-bash") ||
    (className || "").includes("language-sh") ||
    (className || "").includes("language-shell") ||
    isOutput

  const language = isOutput
    ? "Output"
    : languageMatch
      ? languageMatch[1].charAt(0).toUpperCase() + languageMatch[1].slice(1)
      : "Code"
  const codeContent = typeof children === "string" ? children : String(children)

  // Highlight and compute lines for the gutter
  useEffect(() => {
    if (!(codeRef.current && isCodeBlock) || isCollapsed) return

    const el = codeRef.current
    el.className = `${className || "language-plaintext"} hljs`
    el.removeAttribute("data-highlighted")

    try {
      if (!className.includes("language-") && !isOutput) {
        const result = hljs.highlightAuto(codeContent)
        el.innerHTML = result.value
        el.className = `language-${result.language || "plaintext"} hljs`
      } else if (isOutput) {
        el.className = "hljs-output hljs"
        el.textContent = codeContent
      } else {
        hljs.highlightElement(el)
      }
    } catch (error) {
      console.error("Highlight.js error:", error)
      el.textContent = codeContent
    }

    // After rendering, compute the number of lines for the gutter
    // Use textContent to count actual visible lines
    requestAnimationFrame(() => {
      const raw = el.textContent ?? codeContent
      const count = raw.split('\n').length
      setLines(count)
    })
  }, [children, className, isCodeBlock, isOutput, codeContent, isCollapsed])

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

  const handleWrap = () => setIsWrapped(!isWrapped)

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

  // Styles to ensure code blocks are responsive on narrow viewports.
  // Use `isWrapped` to allow users to toggle wrapping; default keeps pre-like behavior.
  const preStyles: React.CSSProperties = {
    margin: 0,
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'border-box',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    whiteSpace: isWrapped ? 'pre-wrap' : 'pre',
     wordBreak: 'break-word',
     overflowWrap: 'anywhere',
     hyphens: 'auto',
  }

  const codeStyles: React.CSSProperties = {
    display: 'block',
    whiteSpace: isWrapped ? 'pre-wrap' : 'pre',
     wordBreak: 'break-word',
     overflowWrap: 'anywhere',
     hyphens: 'auto',
  }

  if (!isCodeBlock) {
    return <span>{children}</span>
  }

  if (inline) {
    return (
      <code
        ref={codeRef as any}
        className={`${className || "language-plaintext"} inline-code rounded px-2 py-0.5 text-sm font-mono bg-snippet-background`}
        {...props}
      >
        {children}
      </code>
    )

  }

  return (
    <div dir="auto" className="not-prose w-full">
      <div className="relative not-prose @container/code-block [&_div+div]:!mt-0 mt-3 mb-3 @md:-mx-4 @md:-mr-4" data-testid="code-block">
        {/* Header (no border as requested) */}
        <div className="flex flex-row px-4 py-2 h-10 items-center rounded-t-xl bg-snippet-header-token border border-snippet-border-token">
          <span className="font-mono text-xs">{language.toLowerCase()}</span>
        </div>

        {/* Sticky controls */}
        <div className="sticky w-full right-2 z-10 @[1280px]/mainview:z-40 @[1280px]/mainview:top-10 top-12 @[0px]/preview:top-5 print:hidden">
          <div className="absolute bottom-1 right-1 flex flex-row gap-0.5">
              <div className="flex flex-row gap-0.5" style={{ opacity: 1 }}>
              <button onClick={handleCollapse} aria-pressed={isCollapsed} className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-100 [&_svg]:shrink-0 select-none text-fg-secondary hover:text-fg-primary disabled:hover:text-fg-secondary bg-surface-l1 hover:bg-surface-l2 disabled:hover:bg-surface-l1 h-8 rounded-xl px-3 text-xs" type="button">
                {isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
                <span className="hidden @sm/code-block:block">{isCollapsed ? 'Expand' : 'Collapse'}</span>
              </button>

              <button onClick={handleWrap} aria-pressed={isWrapped} className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-100 [&_svg]:shrink-0 select-none text-fg-secondary hover:text-fg-primary disabled:hover:text-fg-secondary bg-surface-l1 hover:bg-surface-l2 disabled:hover:bg-surface-l1 h-8 rounded-xl px-3 text-xs ${isWrapped ? 'ring-1 ring-ring' : ''}`} type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wrap-text size-4"><line x1="3" x2="21" y1="6" y2="6"></line><path d="M3 12h15a3 3 0 1 1 0 6h-4"></path><polyline points="16 16 14 18 16 20"></polyline><line x1="3" x2="10" y1="18" y2="18"></line></svg>
                <span className="hidden @sm/code-block:block">{isWrapped ? 'Unwrap' : 'Wrap'}</span>
              </button>

              <button onClick={handleEdit} className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-100 [&_svg]:shrink-0 select-none text-fg-secondary hover:text-fg-primary disabled:hover:text-fg-secondary bg-surface-l1 hover:bg-surface-l2 disabled:hover:bg-surface-l1 h-8 rounded-xl px-3 text-xs" type="button">
                <PencilHeartIcon />
                <span className="hidden @sm/code-block:block">Edit</span>
              </button>
            </div>

            <button onClick={handleCopy} aria-pressed={isCopied} aria-live="polite" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-100 [&_svg]:shrink-0 select-none text-fg-secondary hover:text-fg-primary disabled:hover:text-fg-secondary bg-surface-l1 hover:bg-surface-l2 disabled:hover:bg-surface-l1 h-8 rounded-xl px-3 text-xs" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-[2] size-4"><rect x="3" y="8" width="13" height="13" rx="4" stroke="currentColor"></rect><path fillRule="evenodd" clipRule="evenodd" d="M13 2.00004L12.8842 2.00002C12.0666 1.99982 11.5094 1.99968 11.0246 2.09611C9.92585 2.31466 8.95982 2.88816 8.25008 3.69274C7.90896 4.07944 7.62676 4.51983 7.41722 5.00004H9.76392C10.189 4.52493 10.7628 4.18736 11.4147 4.05768C11.6802 4.00488 12.0228 4.00004 13 4.00004H14.6C15.7366 4.00004 16.5289 4.00081 17.1458 4.05121C17.7509 4.10066 18.0986 4.19283 18.362 4.32702C18.9265 4.61464 19.3854 5.07358 19.673 5.63807C19.8072 5.90142 19.8994 6.24911 19.9488 6.85428C19.9992 7.47112 20 8.26343 20 9.40004V11C20 11.9773 19.9952 12.3199 19.9424 12.5853C19.8127 13.2373 19.4748 13.8114 19 14.2361V16.5829C20.4795 15.9374 21.5804 14.602 21.9039 12.9755C22.0004 12.4907 22.0002 11.9334 22 11.1158L22 11V9.40004V9.35725C22 8.27346 22 7.3993 21.9422 6.69141C21.8826 5.96256 21.7568 5.32238 21.455 4.73008C20.9757 3.78927 20.2108 3.02437 19.27 2.545C18.6777 2.24322 18.0375 2.1174 17.3086 2.05785C16.6007 2.00002 15.7266 2.00003 14.6428 2.00004L14.6 2.00004H13Z" fill="currentColor"></path></svg>
              <span className="hidden @sm/code-block:block">{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Code content area - keep code theme unchanged */}
        <div className="shiki not-prose relative [&_pre]:overflow-auto bg-snippet-background border border-snippet-border-token [&_pre]:rounded-b-lg [&_pre]:px-4 [&_pre]:py-4 !p-0" style={{ borderRadius: '0px 0px 12px 12px', padding: 16, fontSize: '0.9em', fontFamily: 'var(--font-ibm-plex-mono)', lineHeight: '1.5em', display: 'block', overflow: 'hidden' }}>
          {isCollapsed ? (
            <div
              role="button"
              tabIndex={0}
              aria-label={`Collapsed code block, ${lines} hidden lines`}
              className="w-full bg-snippet-background text-sm text-fg-secondary rounded flex items-start"
              onClick={handleCollapse}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCollapse() }}
              style={{ minHeight: 40, padding: '8px 12px' }}
            >
              <div className="text-left">
                <div className="font-mono text-sm">{lines} hidden line{lines === 1 ? '' : 's'}</div>
                <div className="text-xs text-fg-muted mt-0.5">Click to expand</div>
              </div>
            </div>
          ) : (
            <pre className="shiki slack-dark bg-snippet-background" tabIndex={0} style={preStyles}>
              <code
                ref={codeRef as any}
                className={`${className || 'language-plaintext'} hljs`}
                style={codeStyles}
              >
                {children}
              </code>
            </pre>
          )}
        </div>

        <div></div>
        <div className="false flex flex-col gap-2 h-full"></div>
      </div>
    </div>
  )
}
