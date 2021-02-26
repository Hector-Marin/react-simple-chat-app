import './App.css';

import firebase from 'firebase/app';

import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useRef, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

import FireBaseConfig from './firebase-config.json';

firebase.initializeApp(FireBaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        
      </header>
      <section>
        { user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn(){

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )

}

function SignOut(){
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}><span>Salir</span><FontAwesomeIcon icon={faSignOutAlt} color="#574437" /></button>
  )
}

function ChatRoom(){

  const dummy = useRef() 


  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt', 'desc').limit(25);

  const [messages] = useCollectionData(query,{idField:'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;
    
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
      <div className="nav">
        <h1>ChatRoom</h1>
        <SignOut />
      </div>
      <div className="chat">
        { messages && messages.reverse().map(msg => <ChatMessage key={msg.id} message={msg} /> )}
        <div ref={dummy}></div>
      </div>
      <form className="form" onSubmit={sendMessage}>
        <input  value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit"><FontAwesomeIcon icon={faCheck} size="lg" color="#574437" /></button>
      </form>
    </>
  )

}

function ChatMessage(props){
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="" />
      <p>{text}</p>
    </div>
  )
}

export default App;
