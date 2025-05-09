import React from 'react'
import { useSelector } from 'react-redux'

const About = () => {
    const conversation = useSelector(state => state.conversation)

    console.log(conversation.conversation)
    
  return (
    <div>About</div>
  )
}

export default About