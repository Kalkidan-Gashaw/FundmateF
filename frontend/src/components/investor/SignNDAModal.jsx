import { useState, useEffect } from "react";
import { X, Shield, AlertCircle, Loader } from "lucide-react";
import API from "../../services/api";

const SignNDAModal = ({ isOpen, onClose, onSign, signing, startupName, startupId }) => {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(null);
  const [ndaTemplate, setNdaTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNDATemplate();
    }
  }, [isOpen]);

  const fetchNDATemplate = async () => {
    setLoading(true);
    try {
      const response = await API.get("/admin/settings/nda-template");
      setNdaTemplate(response.data.data.value);
    } catch (error) {
      console.error("Error fetching NDA template:", error);
      // Set default template if API fails
      setNdaTemplate(`NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is entered into between the Startup and the Investor.

1. PURPOSE
The Investor acknowledges that the Startup possesses certain confidential information regarding its business, technology, financials, and operations that is valuable and proprietary.

2. CONFIDENTIAL INFORMATION
Confidential Information includes, but is not limited to: business plans, financial statements, customer lists, technical data, product designs, marketing strategies, and any other information marked as confidential or reasonably understood to be confidential.

3. OBLIGATIONS OF INVESTOR
The Investor agrees to:
- Not disclose any Confidential Information to third parties
- Use Confidential Information solely for evaluating a potential investment
- Protect Confidential Information with reasonable care
- Not use Confidential Information to compete with the Startup

4. TERM
This Agreement shall remain in effect for a period of 2 years from the date of signing.

5. RETURN OF INFORMATION
Upon request, the Investor shall return or destroy all Confidential Information received.

6. GOVERNING LAW
This Agreement shall be governed by the laws of Ethiopia.`);
    } finally {
      setLoading(false);
    }
  };

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

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {ndaTemplate}
              </div>
            </div>
          )}

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