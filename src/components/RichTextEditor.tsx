import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Quote,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Share what you learned...',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none min-h-[200px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL', previousUrl);
    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, active = false, disabled = false, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
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
    <div className="border rounded-lg overflow-hidden">
      <div className="border-b bg-white p-2 flex flex-wrap gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          disabled={false}
        >
          <Bold className="w-5 h-5" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          disabled={false}
        >
          <Italic className="w-5 h-5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          disabled={false}
        >
          <Heading2 className="w-5 h-5" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          disabled={false}
        >
          <List className="w-5 h-5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          disabled={false}
        >
          <ListOrdered className="w-5 h-5" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          disabled={false}
        >
          <Code className="w-5 h-5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          disabled={false}
        >
          <Quote className="w-5 h-5" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={setLink}
          active={editor.isActive('link')}
          disabled={false}
        >
          <LinkIcon className="w-5 h-5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={addImage}
          active={false}
          disabled={false}
        >
          <ImageIcon className="w-5 h-5" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
          disabled={!editor.can().undo()}
        >
          <Undo className="w-5 h-5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
          disabled={!editor.can().redo()}
        >
          <Redo className="w-5 h-5" />
        </ToolbarButton>
      </div>

      <EditorContent 
        editor={editor} 
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none p-4 min-h-[200px] bg-white"
      />
    </div>
  );
}; 