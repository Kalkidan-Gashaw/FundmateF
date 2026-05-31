import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  ArrowLeft,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader,
  CheckCircle,
  AlertCircle,
  FolderOpen,
  Target,
  Award,
  FileText
} from "lucide-react";

const AdminSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sector");
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    key: "",
    label: "",
    value: "",
  });
  const [ndaContent, setNdaContent] = useState("");
  const [savingNda, setSavingNda] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchSettings();
  }, []);

  const checkAdminAccess = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.role !== "admin") {
      navigate("/dashboard");
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await API.get("/admin/settings");
      setSettings(response.data.grouped);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({ type: "error", text: "Error loading settings" });
    } finally {
      setLoading(false);
    }
  };

  const fetchNDATemplate = async () => {
    try {
      const response = await API.get("/admin/settings/nda-template");
      setNdaContent(response.data.data.value);
    } catch (error) {
      console.error("Error fetching NDA template:", error);
    }
  };

  const handleSaveNDA = async () => {
    setSavingNda(true);
    try {
      await API.put("/admin/settings/nda-template", { content: ndaContent });
      setMessage({ type: "success", text: "NDA template updated successfully" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Error updating NDA template" });
    } finally {
      setSavingNda(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.key || !formData.label) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    try {
      await API.post("/admin/settings", {
        category: activeTab,
        key: formData.key.toLowerCase().replace(/\s+/g, "_"),
        value: formData.label,
        label: formData.label,
      });
      setMessage({ type: "success", text: "Added successfully" });
      setShowAddModal(false);
      setFormData({ key: "", label: "", value: "" });
      fetchSettings();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Error adding" });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      await API.put(`/admin/settings/${editingItem.id}`, {
        value: editingItem.value,
        label: editingItem.label,
      });
      setMessage({ type: "success", text: "Updated successfully" });
      setEditingItem(null);
      fetchSettings();
    } catch (error) {
      setMessage({ type: "error", text: "Error updating" });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await API.delete(`/admin/settings/${id}`);
      setMessage({ type: "success", text: "Deleted successfully" });
      fetchSettings();
    } catch (error) {
      setMessage({ type: "error", text: "Error deleting" });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case "sector": return <FolderOpen className="h-4 w-4 mr-2" />;
      case "funding_stage": return <Target className="h-4 w-4 mr-2" />;
      case "expertise": return <Award className="h-4 w-4 mr-2" />;
      case "nda_template": return <FileText className="h-4 w-4 mr-2" />;
      default: return <Settings className="h-4 w-4 mr-2" />;
    }
  };

  const getTabLabel = (tab) => {
    switch (tab) {
      case "sector": return "Startup Sectors";
      case "funding_stage": return "Funding Stages";
      case "expertise": return "Mentor Expertise";
      case "nda_template": return "NDA Template";
      default: return tab;
    }
  };

  const tabs = [
    { id: "sector", label: "Startup Sectors" },
    { id: "funding_stage", label: "Funding Stages" },
    { id: "expertise", label: "Mentor Expertise" },
    { id: "nda_template", label: "NDA Template" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Settings className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-1">Manage platform configuration and options</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === "success" 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {message.type === "success" ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "nda_template") {
                  fetchNDATemplate();
                }
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition flex items-center ${
                activeTab === tab.id
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {getTabIcon(tab.id)}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {activeTab === "nda_template" ? (
          <div className="p-6">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">NDA Template</h2>
              <button
                onClick={handleSaveNDA}
                disabled={savingNda}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
              >
                {savingNda ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Template</span>
              </button>
            </div>
            <textarea
              value={ndaContent}
              onChange={(e) => setNdaContent(e.target.value)}
              rows={20}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              This NDA template will be shown to investors when they request access to startup confidential information.
            </p>
          </div>
        ) : (
          <div>
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Manage {getTabLabel(activeTab)}
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add New</span>
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              {settings[activeTab]?.length > 0 ? (
                settings[activeTab].map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition">
                    {editingItem?.id === item.id ? (
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={editingItem.label}
                          onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          autoFocus
                        />
                        <button
                          onClick={handleUpdate}
                          className="p-2 text-green-600 hover:text-green-800 transition"
                        >
                          <Save className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="p-2 text-gray-600 hover:text-gray-800 transition"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-400">Key: {item.key}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-red-600 hover:text-red-800 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-12">
                  <Settings className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No items found</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-3 text-purple-600 hover:text-purple-700 text-sm"
                  >
                    Add your first item
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add New {getTabLabel(activeTab)}</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value, key: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter name"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;