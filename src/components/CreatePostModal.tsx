import { Dialog } from '@headlessui/react';
import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateTILPost } from './CreateTILPost';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MediaAttachment {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  filename: string;
  mimeType: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: {
    content: string;
    category: string;
    media?: MediaAttachment[];
  }) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog as="div" className="relative z-10" onClose={onClose} open={isOpen}>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
          
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-start justify-center px-4 pt-16 pb-24">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="w-full"
                style={{ maxWidth: "640px" }}
              >
                <Dialog.Panel className="w-full transform overflow-hidden rounded-xl bg-white border border-[#e6e6e6] shadow-lg transition-all">
                  <div className="flex items-center justify-between modal-header">
                    <Dialog.Title as="h3">
                      Share your learning
                    </Dialog.Title>
                    <button 
                      onClick={onClose}
                      className="rounded-full p-1 hover:bg-[#f7f7f7] transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="modal-body">
                    <CreateTILPost
                      onSubmit={(post) => {
                        onSubmit(post);
                        onClose();
                      }}
                    />
                  </div>
                </Dialog.Panel>
              </motion.div>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}; 