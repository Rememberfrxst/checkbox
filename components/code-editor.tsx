'use client';

import React, { memo } from 'react';
import { Editor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';

type EditorProps = {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status: 'streaming' | 'idle';
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  suggestions: Array<any>;
};

function PureCodeEditor({
  content,
  onSaveContent,
  status,
  isCurrentVersion
}: EditorProps) {
  const { theme } = useTheme();

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && isCurrentVersion) {
      onSaveContent(value, true);
    }
  };

  return (
    <div className="w-full h-full bg-transparent overflow-hidden">
      <Editor
        height="100%"
        language="javascript"
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        value={content}
        onChange={handleEditorChange}
        options={{
          readOnly: !isCurrentVersion,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: '"SF Mono", Monaco, Menlo, "Ubuntu Mono", monospace',
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: true,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          renderLineHighlight: 'line',
          selectionHighlight: false,
          occurrencesHighlight: false,
          renderIndentGuides: true,
          renderWhitespace: 'none',
          folding: true,
          foldingHighlight: false,
          unfoldOnClickAfterEndOfLine: false,
          showUnused: false,
          bracketPairColorization: { enabled: false },
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            verticalScrollbarSize: 14,
            horizontalScrollbarSize: 14
          }
        }}
      />
    </div>
  );
}

function areEqual(prevProps: EditorProps, nextProps: EditorProps) {
  if (prevProps.suggestions !== nextProps.suggestions) return false;
  if (prevProps.currentVersionIndex !== nextProps.currentVersionIndex) return false;
  if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) return false;
  if (prevProps.status === 'streaming' && nextProps.status === 'streaming') return false;
  if (prevProps.content !== nextProps.content) return false;
  return true;
}

export const CodeEditor = memo(PureCodeEditor, areEqual);

export function CodeEditorComponent({
  title,
  content,
  onSaveContent,
  isCurrentVersion = true,
  status = 'idle',
}: {
  title: string;
  content: string;
  onSaveContent?: (updatedContent: string, debounce: boolean) => void;
  isCurrentVersion?: boolean;
  status?: 'streaming' | 'idle';
}) {
  const { theme } = useTheme();

  return (
    <div className="w-full h-full bg-transparent flex flex-col overflow-hidden">
      <div className="px-4 py-2 border-b border-[#404040] flex items-center bg-[#1a1a1a] shrink-0">
        
        <span className="text-sm font-medium text-white">{title}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language="javascript"
          theme="vs-dark"
          value={content}
          onChange={(value) => {
            if (value && onSaveContent && isCurrentVersion) {
              onSaveContent(value, true);
            }
          }}
          options={{
            readOnly: !isCurrentVersion,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: '"SF Mono", Monaco, Menlo, "Ubuntu Mono", monospace',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: true,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            renderLineHighlight: 'line',
            selectionHighlight: false,
            occurrencesHighlight: false,
            renderIndentGuides: true,
            renderWhitespace: 'none',
            folding: true,
            foldingHighlight: false,
            unfoldOnClickAfterEndOfLine: false,
            showUnused: false,
            bracketPairColorization: { enabled: false },
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false,
              verticalHasArrows: false,
              horizontalHasArrows: false,
              verticalScrollbarSize: 14,
              horizontalScrollbarSize: 14
            }
          }}
        />
      </div>
    </div>
  );
}
