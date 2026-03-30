# ChatRAG — Make your documents into a 24/7 AI Assistant

---

![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)
![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20DB-red?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-Framework-black?style=for-the-badge&logo=express)
![Groq](https://img.shields.io/badge/Groq-LLM-blue?style=for-the-badge)
![LLaMA 3.3](https://img.shields.io/badge/LLaMA--3.3--70B-Model-purple?style=for-the-badge)
![LangChain](https://img.shields.io/badge/LangChain-Orchestration-yellow?style=for-the-badge)


ChatRAG is a Retrieval-Augmented Generation (RAG) based AI assistant designed to turn your documents into a reliable, context-aware support system.

Instead of relying on generic knowledge, ChatRAG retrieves information directly from your uploaded documents and generates responses strictly based on that data. This ensures accuracy, relevance, and eliminates hallucinations.

There is no manual training, no fine-tuning, and no complex setup required.

---

### What makes it powerful?

- Trained instantly on your documents  
- Answers only from your data  
- No coding required for integration   
- Fully deployable in minutes on your platform

---

### Integration in 2 minutes

1. Upload your documents  
2. Copy the generated embed script  
3. Paste it into your platform and here you goo the AI-Assitant working effortlessly 

Your AI assistant is live — ready to handle queries instantly.

---

ChatRAG acts as a 24/7 AI support system for your platform.  
The cool part is you can have a free Ai-Assitant for your platform and its working 24/7 handling user queries 

## Features

### AI Trained on Your Documents
Transform PDFs, policies, product guides, and internal knowledge bases into a smart AI assistant. ChatRAG ingests, processes, and understands your content, ensuring every response is derived from your data.

---

### Context-Aware Responses
ChatRAG goes beyond keyword matching. It understands the intent behind user queries and retrieves the most relevant information before generating a response, ensuring accuracy and relevance.

---

### 24/7 Automated Support
Provide continuous support without increasing operational costs. ChatRAG handles user queries around the clock, delivering instant and consistent responses at scale.

---

### Easy Website Integration
Integrate ChatRAG into your platform within minutes using a simple embed script. No SDKs, no complex configuration, and no engineering overhead required.

---

### Source-Backed Answers
Every response is grounded in your documents. ChatRAG retrieves relevant content and uses it as context, ensuring transparency and eliminating hallucinated answers.

---

### Built for Scale
Designed to handle high volumes of queries efficiently. The ingestion and retrieval pipelines are decoupled, allowing the system to scale seamlessly without performance degradation.

---

### 2-Minute Integration
Deploy your AI assistant in three simple steps:

1. Upload your documents  
2. Copy the embed script  
3. Add it to your website  

Your AI-powered support system becomes instantly available to users.


## Let's Deep Dive into the Underlying Architecture of ChatRAG

ChatRAG is built on two core pipelines:

- Ingestion Pipeline  
- Retrieval Pipeline  

These pipelines operate independently and handle the system efficiently, ensuring accurate and context-aware responses.

---

## Ingestion Pipeline

The ingestion pipeline is responsible for converting raw documents into structured, searchable data.

### Flow Overview


### Step-by-Step

1. **User Onboarding**
   - The user registers and logs into the admin portal  
   - Uploads documents (PDFs, policies, guides) from the document section  

2. **Parsing**
   - Documents are parsed using LangChain  
   - Clean text is extracted and enriched with metadata  

3. **Chunking**
   - Parsed content is split into meaningful semantic chunks  
   - Each chunk retains metadata such as companyId and documentId  

4. **Embedding**
   - Chunks are converted into vector embeddings using  
     `Xenova/bge-base-en-v1.5`  

5. **Vector Storage**
   - Embeddings are stored in Qdrant Vector Database  
   - Indexed for fast semantic search  

6. **Document Storage**
   - Document metadata is stored in MongoDB  
   - Status is updated to `ACTIVE` after successful processing  

---

### Key Design Decision

- Vector insertion is handled asynchronously  
- Uses non-blocking operations (Promises)  
- Prevents request timeouts during heavy ingestion  

---

## Retrieval Pipeline

The retrieval pipeline is responsible for generating accurate responses based on user queries.

### Flow Overview


### Step-by-Step

1. **User Query**
   - User interacts with the chatbot through the embedded widget  

2. **Query Embedding**
   - The query is converted into a vector using the same embedding model  

3. **Semantic Search**
   - Qdrant performs similarity search across stored vectors  
   - Top 5 most relevant chunks are retrieved  

4. **Context Injection**
   - Retrieved chunks are combined with the user query  

5. **Response Generation**
   - Passed to `llama-3.3-70b-versatile` via Groq  
   - Generates response strictly based on retrieved context  

6. **Response Delivery**
   - Final answer is returned to the user in real time  

---

## Chat Widget Integration

ChatRAG can be integrated into any website using a simple script:

```html
<script src="YOUR_BACKEND_URL/widget.js"></script>

Injects chatbot UI dynamically
Uses API key generated from admin portal
Communicates with backend via:
/api/chat/message

```

##System Behavior

-Ingestion and retrieval pipelines are fully decoupled
-No response is generated without retrieved context
-Ensures high accuracy and eliminates hallucinations
-Scales independently for ingestion and query workloads
