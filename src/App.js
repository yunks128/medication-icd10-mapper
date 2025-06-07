import React, { useState } from 'react';
import ICD10ToRXGenerator from './components/ICD10ToRXGenerator';
import RXToICD10Generator from './components/RXToICD10Generator';
import CSVMedicationProcessor from './components/CSVMedicationProcessor';

function App() {
  const [activeTab, setActiveTab] = useState('csv-processor');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('csv-processor')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'csv-processor'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              CSV Bulk Processor
            </button>
            <button
              onClick={() => setActiveTab('rx-to-icd10')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'rx-to-icd10'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              RX to ICD-10
            </button>
            <button
              onClick={() => setActiveTab('icd10-to-rx')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'icd10-to-rx'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              ICD-10 to RX
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="py-6">
        {activeTab === 'csv-processor' && <CSVMedicationProcessor />}
        {activeTab === 'rx-to-icd10' && <RXToICD10Generator />}
        {activeTab === 'icd10-to-rx' && <ICD10ToRXGenerator />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 text-center text-gray-500 text-sm">
          <p>Medication to ICD-10 Mapper v1.0 | For healthcare professionals and organizations</p>
        </div>
      </footer>
    </div>
  );
}

export default App;