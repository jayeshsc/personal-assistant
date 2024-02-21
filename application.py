from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import uuid

application = Flask(__name__)

# Configure generative AI
genai.configure(api_key="your-api-key-here")

# Set up the model
generation_config = {
    "temperature": 0.9,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
}

safety_settings = [
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
]

model = genai.GenerativeModel(model_name="gemini-1.0-pro",
                              generation_config=generation_config,
                              safety_settings=safety_settings)

# Dictionary to store active conversations
active_conversations = {}

@application.route('/')
def index():
    return render_template('index.html')

@application.route('/warn')
def warn():
    return render_template('warn.html')

@application.route('/start_conversation', methods=['POST'])
def start_conversation():
    convo = model.start_chat(history=[])
    # Generate a unique identifier for the conversation
    conversation_id = str(uuid.uuid4())
    # Store the conversation in the dictionary with the conversation_id as the key
    active_conversations[conversation_id] = convo
    # Return the conversation_id in the response
    return jsonify({"conversation_id": conversation_id})


@application.route('/continue_conversation', methods=['POST'])
def continue_conversation():
    data = request.get_json()
    conversation_id = data.get('conversation_id')
    message = data.get('message')

    if not conversation_id or not message:
        return jsonify({"error": "Invalid request. Please provide conversation_id and message."}), 400

    # Retrieve the conversation from the dictionary using the conversation_id
    convo = active_conversations.get(conversation_id)

    if convo is None:
        return jsonify({"error": "Conversation not found."}), 404

    # Continue the conversation with the provided message
    convo.send_message(message)
    response = convo.last.text

    return jsonify({"response": response})


if __name__ == '__main__':
    application.run(debug=True)
