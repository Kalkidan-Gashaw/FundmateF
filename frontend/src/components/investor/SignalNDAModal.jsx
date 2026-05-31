import { useState } from "react";
import { X, Shield, AlertCircle, Loader } from "lucide-react";

const SignNDAModal = ({ isOpen, onClose, onSign, signing, startupName }) => {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(null);

  const handleSign = () => {
    if (!agreed) {
      setError("You must agree to the terms to sign the NDA");
      return;
    }
    setError(null);
    onSign();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Non-Disclosure Agreement</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* NDA Content */}
        <div className="p-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Startup:</strong> {startupName}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-bold text-gray-900">1. Purpose</h3>
            <p className="text-gray-700">
              The Investor acknowledges that the Startup possesses certain confidential information 
              regarding its business, technology, financials, and operations that is valuable and proprietary.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-4">2. Confidential Information</h3>
            <p className="text-gray-700">
              Confidential Information includes, but is not limited to: business plans, financial statements, 
              customer lists, technical data, product designs, marketing strategies, and any other information 
              marked as confidential or reasonably understood to be confidential.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-4">3. Obligations of Investor</h3>
            <p className="text-gray-700">
              The Investor agrees to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Not disclose any Confidential Information to third parties</li>
              <li>Use Confidential Information solely for evaluating a potential investment</li>
              <li>Protect Confidential Information with reasonable care</li>
              <li>Not use Confidential Information to compete with the Startup</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-4">4. Term</h3>
            <p className="text-gray-700">
              This Agreement shall remain in effect for a period of 2 years from the date of signing.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-4">5. Return of Information</h3>
            <p className="text-gray-700">
              Upon request, the Investor shall return or destroy all Confidential Information received.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-4">6. Governing Law</h3>
            <p className="text-gray-700">
              This Agreement shall be governed by the laws of Ethiopia.
            </p>
          </div>

          {/* Agreement Checkbox */}
          <div className="border-t border-gray-200 pt-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">
                I have read and agree to the terms of this Non-Disclosure Agreement. 
                I understand that I am legally bound to keep all confidential information private.
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSign}
              disabled={!agreed || signing}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signing ? <Loader className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              <span>{signing ? "Signing..." : "I Agree & Sign NDA"}</span>
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By signing, you acknowledge that you have read and understand this agreement.
            Your electronic signature is legally binding.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignNDAModal;