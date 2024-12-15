import React, { useState, useEffect } from 'react'
import { addExistingBoard } from '../../store/actions/board.action.js'
import { Microphone, Night } from 'monday-ui-react-core/icons'
import { BreadcrumbLoader } from './BreadcrumbLoader.jsx'
import { generateBoard } from '../../services/board/board.service.remote.js'
import { Button, Flex } from 'monday-ui-react-core'

export function BoardBuilder() {
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [recognition, setRecognition] = useState(null)
    const [isRecording, setIsRecording] = useState(false)
    const [isVoiceInput, setIsVoiceInput] = useState(false)

    useEffect(() => {
        let speechRecognition
        if ('webkitSpeechRecognition' in window) {
            speechRecognition = new window.webkitSpeechRecognition()
        } else {
            speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
        }
        speechRecognition.lang = 'en-US'
        speechRecognition.interimResults = false
        speechRecognition.maxAlternatives = 1

        speechRecognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript
            setDescription(speechResult)
            setIsRecording(false)
            setIsVoiceInput(true)
        }

        speechRecognition.onerror = (event) => {
            setError('Voice recognition error: ' + event.error)
            setIsRecording(false)
        }

        setRecognition(speechRecognition)
    }, [])

    const handleGenerateBoard = async () => {
        setLoading(true)
        setError(null)

        try {
            const board = await generateBoard({ description })
            await addExistingBoard(board.data)
        } catch (err) {
            console.error(err)
            setError('No more tokens... Please try again.')
        }
        setLoading(false)
    }

    const handleVoiceCommand = () => {
        if (recognition) {
            recognition.start()
            setIsRecording(true)
        }
    }

    const handleInputChange = (e) => {
        setDescription(e.target.value)
        setIsVoiceInput(false)
    }

    const handleGenerateButtonClick = () => {
        handleGenerateBoard()
    }

    useEffect(() => {
        if (recognition && description && isVoiceInput) {
            handleGenerateBoard()
        }
    }, [description, isVoiceInput])
    return (
        <>
            {loading && <BreadcrumbLoader />}
            <h1 className='board-builder-title'>Generate your project in seconds</h1>
            <Flex align='center' justify='center' className='board-builder-container'>
                <Button
                    className='mic-icon'
                    onClick={handleVoiceCommand}
                    kind='tertiary'
                    size='xxs'
                    disabled={loading || isRecording}>
                    {isRecording ? 'Recording...' : <Microphone size={18} />}
                </Button>
                <input value={description} onChange={handleInputChange} placeholder='Describe your project...' />
                <Button
                    className='night-icon'
                    onClick={handleGenerateButtonClick}
                    kind='secondary'
                    size='small'
                    disabled={loading}
                    style={{ backgroundColor: '#a25ddc', color: 'white' }}>
                    {loading ? (
                        'Generating...'
                    ) : (
                        <>
                            <Night size={18} /> Generate
                        </>
                    )}
                </Button>

                {error && <p style={{ color: 'grey', fontSize: '0.775rem', margin: '0' }}>{error}</p>}
            </Flex>
        </>
    )
}
