import React, {useRef, useState} from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import {useAuthState} from "react-firebase-hooks/auth";
import {useCollectionData} from "react-firebase-hooks/firestore";




firebase.initializeApp({
    apiKey: "AIzaSyBYT3gaf4jKP-yPhoe2UEi8ZFDXhjEWacY",
    authDomain: "react-chat-pyzh.firebaseapp.com",
    databaseURL: "https://react-chat-pyzh-default-rtdb.firebaseio.com",
    projectId: "react-chat-pyzh",
    storageBucket: "react-chat-pyzh.appspot.com",
    messagingSenderId: "512476625025",
    appId: "1:512476625025:web:52d292c187a67a6182f580",
    measurementId: "G-PYCJMN8WHC"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
    const [user] = useAuthState(auth)

    return (
        <div className="App">
            <header className="App-header">
                <h1>💬 Realtime Chat</h1>
                <SignOut />
            </header>

            <section>
                {user ? <ChatRoom/> : <SignIn/>}
            </section>
        </div>
    );
}

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    }
    return (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
    )
}

function SignOut() {
    return auth.currentUser && (
        <button onClick={() => auth.signOut()}>Sign Out</button>
    )
}

function ChatRoom() {
    const dummy = useRef();

    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt');
  
    const [messages] = useCollectionData(query, { idField: 'id' });
    const [formValue, setFormValue] = useState('');
    //console.log(messagesRef)

    const sendMessage = async (e) => {
        e.preventDefault();

        const {uid, photoURL} = auth.currentUser;
        //console.log(uid)

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL,
        })

        setFormValue('');

        dummy.current.scrollIntoView({behavior: 'smooth'});
    }

    return (
        <>
            <main>
                {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
                <div ref={dummy}></div>
            </main>

            <form onSubmit={sendMessage}>
                <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
                <button type='submit' disabled={!formValue}>🕊️</button>
            </form>
        </>
    )
}

function ChatMessage(props) {
    const {text, uid, photoURL} = props.message;

    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <div className={`message ${messageClass}`}>
            <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt=''/>
            <p>{text}</p>
        </div>
    )
}

export default App;
