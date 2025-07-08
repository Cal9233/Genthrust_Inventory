import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import emailService, { EmailTemplate } from '../../services/email.service';

interface EmailComposerProps {
  quote: any;
  inventoryResults: any;
  onClose: () => void;
  onSent: () => void;
}

const EmailComposer: React.FC<EmailComposerProps> = ({
  quote,
  inventoryResults,
  onClose,
  onSent
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const templateList = await emailService.getTemplates();
      setTemplates(templateList);
      
      // Auto-select template based on inventory results
      const report = inventoryResults?.report;
      if (report) {
        if (report.summary.totalFound === report.summary.totalRequested) {
          setSelectedTemplate('partFound');
        } else if (report.summary.totalFound === 0) {
          setSelectedTemplate('partNotFound');
        } else {
          setSelectedTemplate('mixedResults');
        }
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleSend = async () => {
    try {
      setSending(true);
      await emailService.respondToQuote(quote.id, {
        template: selectedTemplate,
        customMessage: selectedTemplate === 'custom' ? customMessage : undefined
      });
      onSent();
    } catch (error) {
      console.error('Failed to send response:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <div className="flex justify-between items-center">
                        <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                          Send Response
                        </Dialog.Title>
                        <button
                          type="button"
                          className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                          onClick={onClose}
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          To: {quote.sender_email}
                        </label>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Template
                        </label>
                        <select
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">Select a template</option>
                          {templates.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.name} - {template.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedTemplate === 'custom' && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Message
                          </label>
                          <textarea
                            rows={8}
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Type your message here..."
                          />
                        </div>
                      )}

                      {selectedTemplate && selectedTemplate !== 'custom' && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-600">
                            An email will be automatically generated based on the inventory search results using the selected template.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    disabled={!selectedTemplate || sending || (selectedTemplate === 'custom' && !customMessage)}
                    onClick={handleSend}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                  >
                    {sending ? 'Sending...' : 'Send Response'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default EmailComposer;