"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/lib/card';
import Papa from 'papaparse';
import { Trophy, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const TriviaGame = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isSharedGame, setIsSharedGame] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [loadingShared, setLoadingShared] = useState(true);

    useEffect(() => {
        const loadSharedGame = async (gameId) => {
            try {
                const { data, error } = await supabase
                    .from('trivia_games')
                    .select('questions')
                    .eq('game_id', gameId)
                    .single();

                if (error) throw error;
                
                if (data) {
                    setQuestions(data.questions);
                    setIsSharedGame(true);
                }
            } catch (error) {
                console.error('Error loading shared game:', error);
                alert('Error loading the shared game. Please try again.');
            } finally {
                setLoadingShared(false);
            }
        };

        const params = new URLSearchParams(window.location.search);
        const gameId = params.get('gameId');
        
        if (gameId) {
            setLoadingShared(true);
            loadSharedGame(gameId);
        } else {
            setLoadingShared(false);
        }
    }, []);

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvText = e.target.result;
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        setQuestions(results.data);
                    }
                });
            };
            reader.readAsText(file);
        }
    }, []);

    const handleShare = async (questions) => {
        try {
            const gameId = Math.random().toString(36).substring(2, 15);
            
            const { data, error } = await supabase
                .from('trivia_games')
                .insert([
                    { 
                        game_id: gameId,
                        questions: questions
                    }
                ]);

            if (error) throw error;
            
            return gameId;
        } catch (error) {
            console.error('Error saving game:', error);
            throw error;
        }
    };

    const handleStartGame = () => {
        if (questions.length > 0) {
            setGameStarted(true);
            setCurrentQuestion(0);
            setScore(0);
            setShowAnswer(false);
            setSelectedAnswer(null);
        }
    };

    const handleAnswerSelect = (answerIndex) => {
        if (!showAnswer) {
            setSelectedAnswer(answerIndex);
        }
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer !== null) {
            if (selectedAnswer === questions[currentQuestion].correct_index) {
                setScore(score + 1);
            }
            setShowAnswer(true);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setShowAnswer(false);
            setSelectedAnswer(null);
        }
    };

    const getAnswerButton = (index) => {
        const answerKey = `answer${index}`;
        const isCorrect = index === questions[currentQuestion].correct_index;
        const isSelected = selectedAnswer === index;
        
        let buttonClass = "w-full p-4 mb-3 rounded-xl text-left transition-all transform hover:scale-102 ";
        
        if (showAnswer) {
            if (isCorrect) {
                buttonClass += "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg";
            } else if (isSelected) {
                buttonClass += "bg-gradient-to-r from-red-400 to-red-500 text-white shadow-lg";
            } else {
                buttonClass += "bg-gray-100 text-gray-500";
            }
        } else {
            buttonClass += isSelected 
                ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg" 
                : "bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md";
        }

        return (
            <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showAnswer}
                className={buttonClass}
            >
                <div className="flex items-center">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-black bg-opacity-10 mr-3">
                        {String.fromCharCode(64 + index)}
                    </span>
                    {questions[currentQuestion][answerKey]}
                </div>
            </button>
        );
    };

    const progressPercentage = (currentQuestion / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <div className="w-full max-w-3xl mx-auto">
                {loadingShared ? (
                    <Card className="backdrop-blur-lg bg-white bg-opacity-90 shadow-xl">
                        <CardContent className="p-8 flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"/>
                                <p className="text-gray-600">Loading shared game...</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : !gameStarted ? (
                    <Card className="backdrop-blur-lg bg-white bg-opacity-90 shadow-xl">
                        <CardContent className="p-8 space-y-6">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Trivia Challenge
                                </h1>
                                <p className="text-gray-600 mt-2">Test your knowledge and have fun!</p>
                            </div>
                            
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Your Questions
                                </label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="block w-full text-sm text-gray-500 
                                        file:mr-4 file:py-3 file:px-6 
                                        file:rounded-full file:border-0 
                                        file:text-sm file:font-medium
                                        file:bg-gradient-to-r file:from-blue-500 file:to-purple-500
                                        file:text-white
                                        hover:file:opacity-90
                                        cursor-pointer"
                                />
                                {questions.length > 0 && !isSharedGame && (
                                    <div className="space-y-2">
                                        <div className="flex items-center text-green-600">
                                            <Award className="w-5 h-5 mr-2" />
                                            <span>{questions.length} questions loaded</span>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const gameId = await handleShare(questions);
                                                    const url = `${window.location.origin}?gameId=${gameId}`;
                                                    setShareUrl(url);
                                                    await navigator.clipboard.writeText(url);
                                                    alert('Share link copied to clipboard!');
                                                } catch (error) {
                                                    console.error('Error sharing game:', error);
                                                    alert('Error creating share link. Please try again.');
                                                }
                                            }}
                                            className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600"
                                        >
                                            Generate Share Link
                                        </button>
                                        {shareUrl && (
                                            <div className="p-2 bg-gray-100 rounded-md">
                                                <p className="text-sm text-gray-600 break-all">{shareUrl}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <button
                                    onClick={handleStartGame}
                                    disabled={questions.length === 0}
                                    className="w-full py-3 px-6 rounded-xl 
                                        bg-gradient-to-r from-blue-500 to-purple-500 
                                        text-white font-medium shadow-lg
                                        hover:opacity-90 transition-all
                                        disabled:from-gray-400 disabled:to-gray-500
                                        flex items-center justify-center space-x-2"
                                >
                                    <Trophy className="w-5 h-5" />
                                    <span>Start Challenge</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="backdrop-blur-lg bg-white bg-opacity-90 shadow-xl">
                        <CardContent className="p-6 space-y-4">
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">
                                    Question {currentQuestion + 1}/{questions.length}
                                </span>
                                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full">
                                    <Trophy className="w-4 h-4" />
                                    <span>{score}</span>
                                </div>
                            </div>
                            
                            <div className="py-4">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">
                                    {questions[currentQuestion].question}
                                </h2>
                                
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map(index => getAnswerButton(index))}
                                </div>
                            </div>
                            
                            {!showAnswer ? (
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={selectedAnswer === null}
                                    className="w-full py-3 px-6 rounded-xl
                                        bg-gradient-to-r from-blue-500 to-purple-500
                                        text-white font-medium shadow-lg
                                        hover:opacity-90 transition-all
                                        disabled:from-gray-400 disabled:to-gray-500"
                                >
                                    Submit Answer
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    {currentQuestion < questions.length - 1 ? (
                                        <button
                                            onClick={handleNextQuestion}
                                            className="w-full py-3 px-6 rounded-xl
                                                bg-gradient-to-r from-blue-500 to-purple-500
                                                text-white font-medium shadow-lg
                                                hover:opacity-90 transition-all"
                                        >
                                            Next Question
                                        </button>
                                    ) : (
                                        <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                                            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Game Over!</h3>
                                            <p className="text-gray-600 mb-6">
                                                Final Score: {score}/{questions.length}
                                                <br />
                                                ({Math.round((score / questions.length) * 100)}% correct)
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setGameStarted(false);
                                                    setScore(0);
                                                    setCurrentQuestion(0);
                                                }}
                                                className="py-3 px-6 rounded-xl
                                                    bg-gradient-to-r from-blue-500 to-purple-500
                                                    text-white font-medium shadow-lg
                                                    hover:opacity-90 transition-all"
                                            >
                                                Play Again
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default TriviaGame;