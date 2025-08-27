import React, { useState, useRef } from "react";

const App = () => {
  const [assignments, setAssignments] = useState([]);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [gradingResults, setGradingResults] = useState([]);
  const [activeTab, setActiveTab] = useState("create");
  const fileInputRef = useRef(null);

  // Mock data for demonstration
  const commonErrors = [
    "Vorzeichenfehler",
    "Einheit vergessen",
    "Rechenfehler in Zwischenschritt",
    "Formel falsch angewendet",
    "Rundungsfehler",
    "Antwort nicht vollständig"
  ];

  const difficultyLevels = ["Einfach", "Mittel", "Schwer"];

  const addCriterion = () => {
    const newCriteria = {
      id: Date.now(),
      description: "",
      points: 1,
      required: true
    };
    setCurrentAssignment({
      ...currentAssignment,
      criteria: [...currentAssignment.criteria, newCriteria]
    });
  };

  const addAssignment = () => {
    const newAssignment = {
      id: Date.now(),
      title: "Neue Aufgabe",
      description: "",
      difficulty: "Mittel",
      maxPoints: 10,
      criteria: [],
      formula: ""
    };
    setAssignments([...assignments, newAssignment]);
    setCurrentAssignment(newAssignment);
    setActiveTab("edit");
  };

  const updateAssignment = (field, value) => {
    setCurrentAssignment({ ...currentAssignment, [field]: value });
    setAssignments(assignments.map(a => a.id === currentAssignment.id ? { ...currentAssignment, [field]: value } : a));
  };

  const removeCriterion = (criterionId) => {
    setCurrentAssignment({
      ...currentAssignment,
      criteria: currentAssignment.criteria.filter(c => c.id !== criterionId)
    });
  };

  const updateCriterion = (criterionId, field, value) => {
    setCurrentAssignment({
      ...currentAssignment,
      criteria: currentAssignment.criteria.map(c => 
        c.id === criterionId ? { ...c, [field]: value } : c
      )
    });
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newSolutions = files.map(file => ({
      id: Date.now() + Math.random(),
      studentName: file.name.replace('.pdf', '').replace('_', ' '),
      file,
      status: "uploaded",
      points: 0,
      feedback: "",
      errors: []
    }));
    setSolutions([...solutions, ...newSolutions]);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const startGrading = () => {
    if (!currentAssignment || solutions.length === 0) return;

    const results = solutions.map(solution => {
      // Mock grading logic
      const maxPoints = currentAssignment.maxPoints;
      const earnedPoints = Math.floor(Math.random() * (maxPoints + 1));
      const errorCount = Math.floor(Math.random() * 3);
      const selectedErrors = Array.from({ length: errorCount }, () => 
        commonErrors[Math.floor(Math.random() * commonErrors.length)]
      );

      return {
        ...solution,
        points: earnedPoints,
        feedback: generatedFeedback(earnedPoints, maxPoints, selectedErrors),
        errors: selectedErrors,
        status: "graded",
        grade: calculateGrade(earnedPoints, maxPoints)
      };
    });

    setGradingResults(results);
    setActiveTab("results");
  };

  const calculateGrade = (points, maxPoints) => {
    const percentage = (points / maxPoints) * 100;
    if (percentage >= 95) return "1+";
    if (percentage >= 85) return "1";
    if (percentage >= 75) return "2";
    if (percentage >= 65) return "3";
    if (percentage >= 50) return "4";
    if (percentage >= 35) return "5";
    return "6";
  };

  const generatedFeedback = (points, maxPoints, errors) => {
    const percentage = (points / maxPoints) * 100;
    let feedback = "";

    if (percentage >= 85) {
      feedback = "Sehr gut! Du hast die Aufgabe korrekt gelöst. ";
    } else if (percentage >= 70) {
      feedback = "Gut gemacht! Du hast den Lösungsweg weitgehend richtig. ";
    } else if (percentage >= 50) {
      feedback = "Akzeptabel. Du hast einige richtige Ansätze, aber es gibt Verbesserungspotential. ";
    } else {
      feedback = "Du hast Schwierigkeiten mit dieser Aufgabe. Überarbeite den Lösungsweg. ";
    }

    if (errors.length > 0) {
      feedback += "Achte besonders auf: " + errors.join(", ") + ". ";
    }

    feedback += "Überprüfe deine Rechenschritte noch einmal sorgfältig.";

    return feedback;
  };

  const exportResults = () => {
    const csvContent = [
      ["Schüler", "Punkte", "Max. Punkte", "Note", "Fehler", "Feedback"].join(";"),
      ...gradingResults.map(r => [
        r.studentName,
        r.points,
        currentAssignment?.maxPoints || 0,
        r.grade,
        r.errors.join(", "),
        r.feedback
      ].join(";"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `klausur_auswertung_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-500 p-2 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MatheKorrektur</h1>
                <p className="text-sm text-gray-600">Intelligente Klausurkorrektur</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Lehrer:in</p>
                <p className="text-sm text-gray-600">Max Mustermann</p>
              </div>
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">MM</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: "create", label: "Aufgabe erstellen", icon: "Plus" },
              { id: "upload", label: "Lösungen hochladen", icon: "Upload" },
              { id: "grade", label: "Korrigieren", icon: "CheckCircle" },
              { id: "results", label: "Ergebnisse", icon: "BarChart" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {tab.icon === "Plus" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />}
                  {tab.icon === "Upload" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />}
                  {tab.icon === "CheckCircle" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {tab.icon === "BarChart" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                </svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Assignment Tab */}
        {activeTab === "create" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Neue Mathe-Aufgabe erstellen</h2>
                <button
                  onClick={addAssignment}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Neue Aufgabe</span>
                </button>
              </div>

              {assignments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Aufgaben vorhanden</h3>
                  <p className="mt-1 text-sm text-gray-500">Erstellen Sie Ihre erste Mathe-Aufgabe, um mit der Korrektur zu beginnen.</p>
                  <div className="mt-6">
                    <button
                      onClick={addAssignment}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Erste Aufgabe erstellen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      onClick={() => {
                        setCurrentAssignment(assignment);
                        setActiveTab("edit");
                      }}
                      className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 cursor-pointer transition-colors duration-200 border-2 border-transparent hover:border-indigo-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          assignment.difficulty === "Einfach" ? "bg-green-100 text-green-800" :
                          assignment.difficulty === "Mittel" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {assignment.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{assignment.description || "Keine Beschreibung"}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-indigo-600 font-medium">{assignment.maxPoints} Punkte</span>
                        <span className="text-gray-500">{assignment.criteria.length} Kriterien</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Assignment Tab */}
        {activeTab === "edit" && currentAssignment && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Aufgabe bearbeiten</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setActiveTab("create")}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Weiter
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aufgabentitel</label>
                    <input
                      type="text"
                      value={currentAssignment.title}
                      onChange={(e) => updateAssignment("title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
                    <textarea
                      value={currentAssignment.description}
                      onChange={(e) => updateAssignment("description", e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Beschreibung der Aufgabe..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Schwierigkeit</label>
                      <select
                        value={currentAssignment.difficulty}
                        onChange={(e) => updateAssignment("difficulty", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {difficultyLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max. Punkte</label>
                      <input
                        type="number"
                        value={currentAssignment.maxPoints}
                        onChange={(e) => updateAssignment("maxPoints", parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Formel (optional)</label>
                    <input
                      type="text"
                      value={currentAssignment.formula}
                      onChange={(e) => updateAssignment("formula", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="z.B. ax² + bx + c = 0"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Bewertungskriterien</h3>
                    <button
                      onClick={addCriterion}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Hinzufügen</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {currentAssignment.criteria.map((criterion) => (
                      <div key={criterion.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="text"
                            value={criterion.description}
                            onChange={(e) => updateCriterion(criterion.id, "description", e.target.value)}
                            placeholder="Kriterium beschreiben..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          />
                          <button
                            onClick={() => removeCriterion(criterion.id)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Punkte</label>
                            <input
                              type="number"
                              value={criterion.points}
                              onChange={(e) => updateCriterion(criterion.id, "points", parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Typ</label>
                            <select
                              value={criterion.required ? "required" : "optional"}
                              onChange={(e) => updateCriterion(criterion.id, "required", e.target.value === "required")}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="required">Pflichtkriterium</option>
                              <option value="optional">Optional</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    {currentAssignment.criteria.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">Noch keine Kriterien hinzugefügt</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Solutions Tab */}
        {activeTab === "upload" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Lösungen hochladen</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setActiveTab("edit")}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Zurück
                  </button>
                  <button
                    onClick={startGrading}
                    disabled={solutions.length === 0}
                    className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Automatisch korrigieren
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-400 transition-colors duration-200">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Lösungen hochladen</h3>
                <p className="mt-1 text-sm text-gray-500">PDF-Dateien der Schülerlösungen hochladen</p>
                <div className="mt-6">
                  <button
                    onClick={triggerFileInput}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Dateien auswählen
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {solutions.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hochgeladene Lösungen ({solutions.length})</h3>
                  <div className="space-y-3">
                    {solutions.map((solution) => (
                      <div key={solution.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="bg-red-100 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{solution.studentName}</p>
                            <p className="text-sm text-gray-500">PDF • {solution.status}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSolutions(solutions.filter(s => s.id !== solution.id))}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && gradingResults.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Korrigierte Ergebnisse</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={exportResults}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Exportieren</span>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-500 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-900">Durchschnitt</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {(gradingResults.reduce((acc, r) => acc + r.points, 0) / gradingResults.length).toFixed(1)} P
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-green-500 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-900">Beste Leistung</p>
                      <p className="text-2xl font-bold text-green-900">
                        {Math.max(...gradingResults.map(r => r.points))} P
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-purple-500 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-900">Bearbeitet</p>
                      <p className="text-2xl font-bold text-purple-900">{gradingResults.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schüler</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punkte</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fehler</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gradingResults.map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{result.studentName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {result.points}/{currentAssignment?.maxPoints}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-indigo-500 h-1.5 rounded-full" 
                              style={{ width: `${(result.points / currentAssignment?.maxPoints) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            result.grade.startsWith('1') ? 'bg-green-100 text-green-800' :
                            result.grade.startsWith('2') ? 'bg-blue-100 text-blue-800' :
                            result.grade.startsWith('3') ? 'bg-yellow-100 text-yellow-800' :
                            result.grade.startsWith('4') ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {result.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {result.errors.length > 0 ? result.errors.join(', ') : "Keine Fehler"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {result.feedback}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;