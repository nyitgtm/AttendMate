"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import QRCode from "qrcode";

type Teacher = {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    password: string;
    classes: {
      classId: string;
      className: string;
    }[];
  };

  //Student Type Definition
  type Student = {
    selected: any;
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentPicture: string; // Add a field for profile picture URL
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
 * ChatMate component handles the chat functionality for teachers.
 * 
 * @component
 * @returns {JSX.Element} The rendered ChatMate component.
 * 
 * @remarks
 * This component fetches and displays messages for a specific class chat.
 * It allows teachers to send, receive, and delete messages.
 * 
 * @example
 * ```tsx
 * <ChatMate />
 * ```
 * 
 * @function
 * @name ChatMate
 * 
 * @description
 * The ChatMate component is responsible for managing the chat interface for teachers.
 * It retrieves teacher data from local storage and redirects to the teacher page if no valid data is found.
 * It also handles fetching, sending, and deleting messages for a specific class chat.
 * 
 * @hook
 * @name useEffect
 * @description
 * - Fetches teacher data from local storage and sets the teacher state.
 * - Sets up an interval to fetch messages for the selected class chat every 5 seconds.
 * 
 * @hook
 * @name useState
 * @description
 * - `teacher`: Stores the teacher data.
 * - `myMessages`: Stores the list of messages for the selected class chat.
 * - `newMessage`: Stores the new message input value.
 * - `classChatId`: Stores the ID of the selected class chat.
 * 
 * @function
 * @name handleReceiveMessage
 * @description
 * Fetches messages for the given class ID and updates the `myMessages` state.
 * 
 * @param {string} givenClassId - The ID of the class to fetch messages for.
 * 
 * @function
 * @name handleSendMessage
 * @description
 * Sends a new message or a reply to the given class ID and updates the messages.
 * 
 * @param {string} givenClassId - The ID of the class to send the message to.
 * @param {string} givenMessage - The message text to send.
 * @param {boolean} isReply - Indicates if the message is a reply.
 * @param {string} replyingSender - The sender of the message being replied to.
 * @param {string} replyingText - The text of the message being replied to.
 * 
 * @function
 * @name deleteMessage
 * @description
 * Deletes a message for the given class ID and updates the messages.
 * 
 * @param {string} givenClassId - The ID of the class to delete the message from.
 * @param {string} givenMessage - The message text to delete.
 * @param {string} sender - The sender of the message to delete.
 */
export default function ChatMate() {
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const router = useRouter();

    useEffect(() => {
        const teacherData = JSON.parse(localStorage.getItem("teacherData") || "{}");
        if (!teacherData?.teacherId) {
            router.push("/teacher");
        } else {
            setTeacher(teacherData);
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
            body: JSON.stringify({ classId: givenClassId, message: givenMessage, sender: teacher?.teacherId, isReply: isReply, replyingSender: replyingSender, replyingText: replyingText }),
        });
        const { messages } = await res.json();
        handleReceiveMessage(givenClassId);
    }

    const deleteMessage = async (givenClassId : string, givenMessage : string, sender : string) => {
        const res = await fetch('/api/chatmate/deletemessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classId: givenClassId, message: givenMessage, sender: sender}),
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
                <h1 className="text-xl font-semibold">ChatMate - {teacher?.teacherName.split(' ')[0]} ({teacher?.teacherId})</h1>
            </div>
            <div className="flex items-center space-x-4">
                <button onClick={() => router.push("/teacher/dashboard")} className="bg-red-500 text-white px-4 py-2 rounded-md">AttendMate</button>
            </div>
        </header> 

        {!classChatId && (
            <div className="flex items-center justify-center space-x-4 p-4">
            {teacher?.classes.length === 0 ? (
                <p>No classes available</p>
            ) : (
                teacher?.classes.map((classItem) => (
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
                    <div key={`${msg.id}-${index}`} className={`mb-2 p-2 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{msg.sender}</p>
                            <p>{msg.text}</p>
                        </div>
                        <button onClick={() => deleteMessage(classChatId, msg.text, msg.sender)} className="text-red-500">
                            <Image
                                src="/trash-can.svg"
                                alt="Trash Can"
                                width={20}
                                height={20}
                            />
                        </button>
                    </div>
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
                                    <div key={`${msg.id}-${replyIndex}`} className="mb-2 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{reply.sender}</p>
                                            <p>{reply.text}</p>
                                        </div>
                                        <button onClick={() => deleteMessage(classChatId, reply.text, reply.sender)} className="text-red-500">
                                            <Image
                                                src="/trash-can.svg"
                                                alt="Trash Can"
                                                width={20}
                                                height={20}
                                            />
                                        </button>
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