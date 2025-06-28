"use client";
import React, { useState } from 'react';

// --- Data for the FAQs ---
const faqData = [
  {
    question: "How do I add items from the Dashboard?",
    answer: (
      <>
        <p className="mb-4">You can quickly add a new transaction or budget directly from the Dashboard.</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Click the {"'"}+{"'"} Button:</strong> Locate the floating action button, typically in the bottom right corner.</li>
          <li><strong>Select an Option:</strong> A menu will appear. Choose from:
            <ul className="list-circle space-y-1 pl-6 mt-2">
              <li><code className="bg-gray-300 dark:text-gray-800 text-sm font-mono rounded px-2 py-1">expense</code>: To record a new expense.</li>
              <li><code className="bg-gray-300 dark:text-gray-800 text-sm font-mono rounded px-2 py-1">income</code>: To record a new income.</li>
              <li><code className="bg-gray-300 dark:text-gray-800 text-sm font-mono rounded px-2 py-1">budget</code>: To create a new budget.</li>
            </ul>
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "What information can I see on the Dashboard?",
    answer: (
      <>
        <p className="mb-4">The Dashboard is your central hub for a quick overview of your financial health, including:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Monthly Summary:</strong> A clear view of your total income and expenses for the current month.</li>
          <li><strong>Pinned Budget:</strong> Any budget you{"'"}ve pinned for close tracking is displayed here.</li>
          <li><strong>Recent Transactions:</strong> A list of your most recent financial activities.</li>
          <li><strong>Monthly Spending Chart:</strong> A pie chart visualizing your spending by category for the current month.</li>
          <li><strong>Weekly Activity Chart:</strong> A bar chart showing your income vs. expense for each day of the past week.</li>
        </ul>
      </>
    ),
  },
  {
      question: "How do I add a transaction?",
      answer: (
        <p>You can add transactions from the Transactions page. Click the <strong className="font-semibold">{"'"}+{"'"}</strong> button and then select between <code className="bg-gray-300 dark:text-gray-800 text-sm font-mono rounded px-2 py-1">expense</code> and <code className="bg-gray-300 dark:text-gray-800  text-sm font-mono rounded px-2 py-1">income</code>.</p>
      ),
  },
  {
    question: "How do I edit or delete a transaction?",
    answer: (
      <>
        <p className="mb-4">From the Transactions page, you can manage all your entries.</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>To Edit:</strong> Tap on the transaction you wish to modify, click the {"'"}Edit{"'"} icon ( pencil), make your changes, and save.</li>
          <li><strong>To Delete:</strong> Swipe the transaction entry to reveal a {"'"}Delete{"'"} option, or tap the transaction and find the {"'"}Delete{"'"} icon (a trash can). Confirm to delete.</li>
        </ul>
      </>
    ),
  },
  {
      question: "How do I add, edit, or delete a budget?",
      answer: (
        <>
          <p className="mb-4">All budget management is done on the Budgets page.</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Add Budget:</strong> Click the <strong className="font-semibold">{"'"}+{"'"}</strong> button on the Budgets page to create a new one.</li>
            <li><strong>Edit or Delete Budget:</strong> Head over to the Budgets page. You can click the  {"'"}Edit{"'"} Icon or the {"'"}Delete{"'"} Icon in the budget.</li>
          </ul>
        </>
      ),
  },
  {
    question: "How can I pin a budget to the Dashboard?",
    answer: (
      <>
        <p className="mb-4">To keep an important budget in focus, you can pin it to your Dashboard.</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Go to the <strong>Budgets</strong> page.</li>
          <li>Locate the budget you want to feature.</li>
          <li>Click the <strong>{"'"}Pin{"'"} icon</strong> next to the budget. The icon will change to indicate it{"'"}s pinned.</li>
          <li>The budget will now appear on your Dashboard for easy monitoring.</li>
        </ol>
      </>
    ),
  },
  {
    question: "How do I change the app's theme?",
    answer: (
      <p>You can customize the app{"'"}s appearance by clicking the <strong>theme button</strong> (a sun or moon icon) located in the top right corner of the screen.</p>
    ),
  },
];


// --- Reusable FAQ Item Component ---
const FAQItem = ({ question, answer }: {question: string,answer: React.ReactElement}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="flex w-full items-center justify-between py-4 text-left font-semibold text-gray-800 dark:text-white hover:text-blue-600 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg">{question}</span>
        <span className="text-2xl font-bold">{isOpen ? '-' : '+'}</span>
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}
      >
        <div className="pb-6 leading-relaxed text-gray-700 dark:text-white">
          {answer}
        </div>
      </div>
    </div>
  );
};


// --- Main Help Page Component ---
const HelpPage = () => {
  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4'>
        {/* This div represents the Card component from your example */}
        <div className='w-full max-w-[800px] rounded-xl bg-white dark:bg-gray-800 dark:text-white p-8 shadow-lg'>
            <h1 className="mb-2 text-center text-4xl font-bold text-gray-900 dark:text-white">Help Center</h1>
            <p className="mb-10 text-center text-gray-600 dark:text-white">
              Welcome to the help center! Find answers to common questions below.
            </p>
            <div className="faq-list">
              {faqData.map((item, index) => (
                <FAQItem key={index} question={item.question} answer={item.answer} />
              ))}
            </div>
        </div>
    </div>
  );
};

export default HelpPage;