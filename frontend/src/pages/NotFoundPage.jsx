import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UniBitesIcon } from '../components/common/UniBitesLogo';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center animate-fadeIn">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-center">
          <UniBitesIcon className="w-16 h-16" />
        </div>
        <div className="space-y-2">
          <div className="text-5xl font-mono font-black text-primary">404</div>
          <h2 className="text-2xl font-serif font-black text-stone-900 dark:text-white">Page Not Found</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Looks like this campus stall or page has moved or doesn't exist.
          </p>
        </div>
        <div>
          <Link to="/">
            <Button variant="primary" icon={ArrowLeft} iconPosition="left" className="font-mono">
              Back to UniBites Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
