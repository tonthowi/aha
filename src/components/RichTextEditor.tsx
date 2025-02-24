import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useCallback, useEffect } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Code, Quote, Heading2, Link as LinkIcon, Image as ImageIcon,
  Undo, Redo, AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  maxLength?: number;
  autosaveInterval?: number;
  onImageUpload?: (file: File) => Promise<string>;
  readOnly?: boolean;
  className?: string;
  showCharacterCount?: boolean;
  minHeight?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Share what you learned...',
  maxLength,
  autosaveInterval = 3000,
  onImageUpload,
  readOnly = false,
  className = '',
  showCharacterCount = true,
  minHeight = '200px',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        paragraph: {
          HTMLAttributes: {
            class: 'leading-normal text-[15px] my-0.5',
          },
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'pl-4 my-0.5',
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'pl-4 my-0.5',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[13px]',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-lg bg-gray-100 p-3 font-mono text-[13px] my-1',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-600 underline',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-2',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none before:h-0 before:text-[15px]',
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none py-2 ${className} [&_p]:my-0.5 [&_p]:leading-normal [&_p]:text-[15px] [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-1`,
        style: `min-height: ${minHeight}`,
      },
      handleDrop: (view, event, slice, moved) => {
        if (!onImageUpload || moved) return false;

        const files = Array.from(event?.dataTransfer?.files || []);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) return false;

        event.preventDefault();

        imageFiles.forEach(async (file) => {
          try {
            const imageUrl = await onImageUpload(file);
            const { tr } = view.state;
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos || view.state.tr.selection.from;
            if (editor?.schema.nodes.image) {
              view.dispatch(tr.insert(pos, editor.schema.nodes.image.create({ src: imageUrl })));
            }
          } catch (error) {
            console.error('Failed to upload image:', error);
          }
        });

        return true;
      },
      handlePaste: (view, event) => {
        if (!onImageUpload) return false;

        const files = Array.from(event.clipboardData?.files || []);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) return false;

        event.preventDefault();

        imageFiles.forEach(async (file) => {
          try {
            const imageUrl = await onImageUpload(file);
            const { tr } = view.state;
            if (editor?.schema.nodes.image) {
              view.dispatch(tr.replaceSelectionWith(editor.schema.nodes.image.create({ src: imageUrl })));
            }
          } catch (error) {
            console.error('Failed to upload image:', error);
          }
        });

        return true;
      },
    },
    onFocus: ({ editor }) => {
      editor.chain().focus().run();
    },
    onSelectionUpdate: ({ editor }) => {
      editor.chain().focus().run();
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
  });

  const handleFormat = useCallback((callback: () => boolean) => {
    if (!editor) return;
    editor.chain().focus().run();
    callback();
  }, [editor]);

  const addImage = useCallback(async () => {
    if (!editor) return;
    
    if (onImageUpload) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (file) {
          try {
            const url = await onImageUpload(file);
            editor.chain().focus().setImage({ src: url }).run();
          } catch (error) {
            console.error('Failed to upload image:', error);
          }
        }
      };
      input.click();
    } else {
      const url = window.prompt('Enter image URL');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  }, [editor, onImageUpload]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL', previousUrl);
    
    if (url === null) return;
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Add https:// if no protocol is specified
    const formattedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: formattedUrl }).run();
  }, [editor]);

  useEffect(() => {
    if (!editor || !content) return;
    
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor || !autosaveInterval) return;

    const interval = setInterval(() => {
      const html = editor.getHTML();
      if (html !== content) {
        onChange(html === '<p></p>' ? '' : html);
      }
    }, autosaveInterval);

    return () => clearInterval(interval);
  }, [editor, autosaveInterval, onChange, content]);

  if (!editor) {
    return null;
  }

  const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, active = false, disabled = false, children, title }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        editor?.chain().focus().run();
        onClick();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        active 
          ? 'bg-gray-200 text-gray-900' 
          : 'text-gray-600 hover:bg-gray-100'
      } ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {!readOnly && (
        <div className="border-b bg-gray-50 p-1.5 flex flex-wrap gap-0.5">
          <ToolbarButton
            onClick={() => handleFormat(() => editor.chain().focus().toggleBold().run())}
            active={editor?.isActive('bold')}
            title="Bold (⌘+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => handleFormat(() => editor.chain().focus().toggleItalic().run())}
            active={editor?.isActive('italic')}
            title="Italic (⌘+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => handleFormat(() => editor.chain().focus().toggleUnderline().run())}
            active={editor?.isActive('underline')}
            title="Underline (⌘+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => handleFormat(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
            active={editor?.isActive('heading', { level: 2 })}
            title="Heading (⌘+⇧+1)"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <ToolbarButton
            onClick={() => handleFormat(() => editor.chain().focus().setTextAlign('left').run())}
            active={editor?.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => handleFormat(() => editor.chain().focus().setTextAlign('center').run())}
            active={editor?.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => handleFormat(() => editor.chain().focus().setTextAlign('right').run())}
            active={editor?.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <ToolbarButton
            onClick={() => handleFormat(() => editor.chain().focus().toggleBulletList().run())}
            active={editor?.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => handleFormat(() => editor.chain().focus().toggleOrderedList().run())}
            active={editor?.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <ToolbarButton
            onClick={() => handleFormat(() => editor.chain().focus().toggleCodeBlock().run())}
            active={editor?.isActive('codeBlock')}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => handleFormat(() => editor.chain().focus().toggleBlockquote().run())}
            active={editor?.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <ToolbarButton
            onClick={setLink}
            active={editor?.isActive('link')}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={addImage}
            active={false}
            title="Add Image"
          >
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <ToolbarButton
            onClick={() => handleFormat(() => editor.chain().focus().undo().run())}
            active={false}
            disabled={!editor?.can().undo()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => handleFormat(() => editor.chain().focus().redo().run())}
            active={false}
            disabled={!editor?.can().redo()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>
      )}

      <div className="px-3">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none bg-white [&>div]:min-h-[150px] [&>div]:text-[15px] [&>div]:leading-normal"
        />
      </div>

      {showCharacterCount && (
        <div className="text-xs text-gray-500 px-3 py-1.5 border-t">
          {editor?.storage.characterCount.characters()} characters
          {maxLength && ` / ${maxLength}`}
          {' • '}
          {editor?.storage.characterCount.words()} words
        </div>
      )}
    </div>
  );
}; 