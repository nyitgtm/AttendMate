"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import QRCode from "qrcode";

type Student = {
    studentId: string;
    studentName: string;
    studentEmail: string;
    classes: {
        classId: string;
        attendance: {
            scheduledTime: string;
            checkInTime: string;
            status: string;
            points: number;
        }[];
    }[];
};

type Message = {
    classId: string;
    messages: {
        sender: string;
        text: string;
        replies: {
            sender: string;
            text: string;
        }[];
    }[];
};

/**
 * ChatMate component handles the chat functionality for students.
 * 
 * @component
 * @returns {JSX.Element} The rendered component.
 * 
 * @example
 * <ChatMate />
 * 
 * @remarks
 * This component fetches student data from local storage and redirects to the student page if no student data is found.
 * It allows students to send and receive messages in a class chat.
 * 
 * @function
 * @name ChatMate
 * 
 * @typedef {Object} Student
 * @property {string} studentId - The ID of the student.
 * @property {string} studentName - The name of the student.
 * @property {Array<{ classId: string }>} classes - The classes the student is enrolled in.
 * 
 * @typedef {Object} Message
 * @property {number} id - The ID of the message.
 * @property {string} text - The text of the message.
 * @property {string} sender - The sender of the message.
 * @property {Array<{ sender: string, text: string }>} replies - The replies to the message.
 * 
 * @state {Student | null} student - The current student data.
 * @state {Array<Message>} myMessages - The messages in the chat.
 * @state {string} newMessage - The new message being typed.
 * @state {string | null} classChatId - The ID of the current class chat.
 * 
 * @hook {useEffect} - Fetches student data from local storage and sets the student state. Redirects to the student page if no student data is found.
 * @hook {useEffect} - Sets up an interval to fetch messages every 5 seconds when a class chat is open.
 * 
 * @function handleReceiveMessage
 * @async
 * @param {string} givenClassId - The ID of the class to fetch messages for.
 * @description Fetches messages for the given class and updates the state.
 * 
 * @function handleSendMessage
 * @async
 * @param {string} givenClassId - The ID of the class to send the message to.
 * @param {string} givenMessage - The message to send.
 * @param {boolean} isReply - Whether the message is a reply.
 * @param {string} replyingSender - The sender of the message being replied to.
 * @param {string} replyingText - The text of the message being replied to.
 * @description Sends a message to the given class and fetches the updated messages.
 */
export default function ChatMate() {
    const [student, setStudent] = useState<Student | null>(null);
    const router = useRouter();

    useEffect(() => {
        const studentData = JSON.parse(localStorage.getItem("studentData") || "{}");
        if (!studentData?.studentId) {
            router.push("/student");
        } else {
            setStudent(studentData);
        }
    }, [router]);

    const [myMessages, setMessages] = useState<{ id: number; text: string; sender: string; replies: { sender: string; text: string }[] }[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const [classChatId, setClassChatId] = useState<string | null>(null); 

    const handleReceiveMessage = async (givenClassId : string) => {
            const res = await fetch('/api/chatmate/recievemessages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId: givenClassId }),
            });
            const { messages } = await res.json();
            const messagesWithId = messages.map((msg: any, index: number) => ({ ...msg, id: index }));
            setMessages(messagesWithId);
        };

    const handleSendMessage = async (givenClassId : string, givenMessage : string, isReply: boolean, replyingSender : string, replyingText : string) => {
        const res = await fetch('/api/chatmate/sendmessages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classId: givenClassId, message: givenMessage, sender: student?.studentId, isReply: isReply, replyingSender: replyingSender, replyingText: replyingText }),
        });
        const { messages } = await res.json();
        handleReceiveMessage(givenClassId);
    }

    useEffect(() => {
        if (classChatId) {
            const interval = setInterval(() => {
                handleReceiveMessage(classChatId);
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [classChatId]);

    return (
        <div className="min-h-screen bg-white relative text-black">
           <header className="flex items-center justify-between bg-green-600 text-white p-4">
            <div className="flex items-center space-x-2">
                <Image
                    src="/attendmatelogo.png"
                    alt="Logo"
                    width={40}
                    height={40}
                />
                <h1 className="text-xl font-semibold">ChatMate - {student?.studentName.split(' ')[0]} ({student?.studentId})</h1>
            </div>
            <div className="flex items-center space-x-4">
                <button onClick={() => router.push("/student/dashboard")} className="bg-red-500 text-white px-4 py-2 rounded-md">AttendMate</button>
            </div>
        </header> 

        {!classChatId && (
            <div className="flex items-center justify-center space-x-4 p-4">
            {student?.classes.length === 0 ? (
                <p>No classes available</p>
            ) : (
                student?.classes.map((classItem) => (
                    <div key={classItem.classId} className="mb-4">
                        <button
                            onClick={() => {
                                setClassChatId(classItem.classId);
                                handleReceiveMessage(classItem.classId);
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                        >
                            <h2 className="text-lg font-semibold">Class ID: {classItem.classId}</h2>
                            Open Class Chat
                        </button>
                    </div>
                ))
            )}
            </div>
        )}

        {classChatId && (
            <div className="flex items-center justify-center space-x-4 p-4">
            <div className="w-1/2 max-h-full">
                <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="border p-2 w-full"
                />
                <button
                    onClick={() => {
                        handleSendMessage(classChatId, newMessage, false, '', '');
                        setNewMessage('');
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                    Send
                </button>
                </div>
                <div className="h-screen overflow-y-auto border p-4">
                {myMessages.map((msg, index) => (
                    <div key={`${msg.id}-${index}`} className="mb-2">
                    <p className="font-semibold">{msg.sender}</p>
                    <p>{msg.text}</p>
                    {msg.replies && msg.replies.length === 0 && (
                        <div className="ml-4">
                            <p
                                className="text-blue-500 cursor-pointer"
                                onClick={() => {
                                    const input = document.querySelector(`#reply-input-${msg.id}`) as HTMLInputElement;
                                    if (input) {
                                        input.style.display = 'block';
                                        input.focus();
                                    }
                                }}
                            >
                                Reply
                            </p>
                            <div className="flex flex-col items-center space-y-2 mt-2" style={{ display: 'none' }} id={`reply-input-${msg.id}`}>
                                <input
                                    type="text"
                                    placeholder="Type a reply..."
                                    className="border p-2 w-full"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    onClick={() => {
                                        const input = document.querySelector(`#reply-input-${msg.id}`) as HTMLInputElement;
                                        if (newMessage) {
                                            handleSendMessage(classChatId, newMessage, true, msg.sender, msg.text);
                                            setNewMessage('');
                                            input.style.display = 'none';
                                        }
                                    }}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                                >
                                    Reply
                                </button>
                            </div>
                        </div>
                    )}
                    {msg.replies && msg.replies.length > 0 && (
                        <details className="ml-4">
                            <summary className="cursor-pointer text-blue-500">Replies</summary>
                            <div className="pl-4">
                                {msg.replies.map((reply, replyIndex) => (
                                    <div key={`${msg.id}-${replyIndex}`} className="mb-2">
                                        <p className="font-semibold">{reply.sender}</p>
                                        <p>{reply.text}</p>
                                    </div>
                                ))}
                            </div>
                        <div className="flex items-center space-x-2 mt-2">
                            <input
                                type="text"
                                placeholder="Type a reply..."
                                className="border p-2 w-full"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />

                            <button
                                onClick={() => {
                                    const input = document.querySelector(`#reply-input-${msg.id}`) as HTMLInputElement;
                                    if (newMessage) {
                                        handleSendMessage(classChatId, newMessage, true, msg.sender, msg.text);
                                        setNewMessage('');
                                    }
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                            >
                                Reply
                            </button>
                        </div>
                        </details>
                    )}
                    </div>
                ))}
                </div>
            </div>
            </div>
        )}



    </div>
    );
}