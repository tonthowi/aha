import { Dialog } from '@headlessui/react';
import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateTILPost } from './CreateTILPost';

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
    title: string;
    content: string;
    category: string;
    isPrivate: boolean;
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
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-start justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="w-full"
                style={{ maxWidth: "640px" }} // Match post card width
              >
                <Dialog.Panel className="w-full transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all mt-28">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    What did you learn today?
                  </Dialog.Title>
                  <CreateTILPost
                    onSubmit={(post) => {
                      onSubmit(post);
                      onClose();
                    }}
                  />
                </Dialog.Panel>
              </motion.div>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}; 