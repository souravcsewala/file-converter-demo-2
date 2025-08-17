import  { useState, useEffect } from "react";
import { FaFileWord } from "react-icons/fa6";
import axios from "axios";
import { serverUrl } from "../global/server";
function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [convert, setConvert] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [showModal, setShowModal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setShowModal(true);
  }, []);

  const handleFileChange = (e) => {
    // console.log(e.target.files[0]);
    setSelectedFile(e.target.files[0]);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setConvert("Please select a file");
      return;
    }
    setIsLoading(true);
    setConvert("");
    setDownloadError("");
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const response = await axios.post(
        `${serverUrl}/convertFile`,
        formData,
        {
          responseType: "blob",
        }
      );
      console.log(response.data);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      console.log(url);
      const link = document.createElement("a");
      console.log(link);
      link.href = url;
      console.log(link);
      link.setAttribute(
        "download",
        selectedFile.name.replace(/\.[^/.]+$/, "") + ".pdf"
      );
      console.log(link);
      document.body.appendChild(link);
      console.log(link);
      link.click();
      link.parentNode.removeChild(link);
      setSelectedFile(null);
      setDownloadError("");
      setConvert("File Converted Successfully");
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status == 400) {
        setDownloadError("Error occurred: ", error.response.data.message);
      } else {
        setConvert("");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2 text-center">This is a demo project</h2>
            <p className="mb-2 text-center text-red-600 font-semibold">Not scalable for production</p>
            <p className="mb-2 text-center">A lot of projects are coming like:</p>
            <ul className="list-disc pl-6 mb-2">
              <li>PDF converter</li>
              <li>Image format converter</li>
              <li>YouTube and Insta video downloader</li>
            </ul>
            <p className="mb-2 text-center">Connect with us if you have any feedback.</p>
            <p className="text-center">Give WhatsApp message on <a href="https://wa.me/919875532535" className="text-blue-600 underline hover:text-blue-800 cursor-pointer" target="_blank" rel="noopener noreferrer">sourav engineer wala</a></p>
            <hr className="my-3" />
            <p className="text-center text-sm text-gray-600">Maximum file size: 10MB</p>
            <p className="text-center text-sm text-gray-600">Server is free hosted - may have slow response</p>
            <p className="text-center text-sm text-gray-600">Server may take up to 1 minute to respond</p>
          </div>
        </div>
      )}
      <div className="max-w-screen-2xl mx-auto container px-6 py-3 md:px-40" style={{ backgroundColor: '#caf0f8', minHeight: '100vh' }}>
        <div className="flex h-screen items-center justify-center">
          <div className="border-2 border-dashed px-4 py-2 md:px-8 md:py-6 border-indigo-400 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-center mb-4">
              Convert Word to PDF Online
            </h1>
            <p className="text-sm text-center mb-5">
              Easily convert Word documents to PDF format online, without having
              to install any software.
            </p>

            <div className="flex flex-col items-center space-y-4">
              <input
                type="file"
                accept=".doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="FileInput"
              />
              <label
                htmlFor="FileInput"
                className="w-full flex items-center justify-center px-4 py-6 bg-gray-100 text-gray-700 rounded-lg shadow-lg cursor-pointer border-blue-300 hover:bg-blue-700 duration-300 hover:text-white"
              >
                <FaFileWord className="text-3xl mr-3" />
                <span className="text-2xl mr-2 ">
                  {selectedFile ? selectedFile.name : "Choose File"}
                </span>
              </label>
              <button
                onClick={handleSubmit}
                disabled={!selectedFile || isLoading}
                className="text-white bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 disabled:pointer-events-none duration-300 font-bold px-4 py-2 rounded-lg flex items-center justify-center min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Converting...
                  </>
                ) : (
                  "Convert File"
                )}
              </button>
              {convert && (
                <div className="text-green-500 text-center">{convert}</div>
              )}
              {downloadError && (
                <div className="text-red-500 text-center">{downloadError}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
