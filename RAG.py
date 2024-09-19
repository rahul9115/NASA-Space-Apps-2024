import h5py
from langchain.text_splitter import CharacterTextSplitter
from langchain.docstore.document import Document
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain_core.prompts import PromptTemplate
from langchain import hub
import pinecone
import openai
import os
from langchain.chains import LLMChain
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from langchain.chains import RetrievalQA
openai.api_key=os.environ.get("OPENAI_API_KEY")

load_dotenv()
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
def data_store():
   

    # Check if the index exists, create if not
    # if "earthdata" not in pc.list_indexes():
    #     pc.create_index(
    #         name="earthdata",
    #         dimension=1536,  # Depends on the embedding model you're using
    #         metric='cosine',
    #         spec=ServerlessSpec(
    #             cloud='aws',
    #             region='us-east-1'
    #         )
    #     )

    # Connect to the index
    index = pc.Index("earthdata")

    # Function to extract data from HDF5 file
    def extract_h5_data(hdf_file):
        data_dict = {}
        
        def extract_dataset(name, obj):
            if isinstance(obj, h5py.Dataset):
                data_dict[name] = obj[:].tolist()  # Convert to list if numpy array
            
        hdf_file.visititems(extract_dataset)
        return data_dict

    # Path to the HDF5 file
    hdf5_file_path = "ATL13QL_20240620221635_00532401_006_01.h5"

    # Extract and process data
    with h5py.File(hdf5_file_path, 'r') as hdf_file:
        extracted_data = extract_h5_data(hdf_file)

    # Initialize OpenAI Embeddings
    embeddings = OpenAIEmbeddings(openai_api_key=os.environ.get("OPENAI_API_KEY"))

    # Process extracted data for Pinecone (loop through keys, embed each)
    count=0
    for key, data in extracted_data.items():
        # Convert data to string format for embedding
        count+=1
        if count==10:
            break
        data_str = str(data)
        print(key,data_str)
        # Get embedding vector
        # embedding_vector = embeddings.embed_query(data_str)
        # print(embedding_vector)
        # # Upsert data into Pinecone index
        index.upsert(vectors=[(key, embedding_vector, {"source": "earth data", "dataset": key,"text":(str(key)+data_str)})])       
        fetched_data = index.fetch(ids=["entire-hdf5"])

# Extract the stored vector and metadata
  

def RAG():  
    embeddings=OpenAIEmbeddings()
    llm=ChatOpenAI()
    query="Based on the data can you give some insights to the farmers for any whether conditions"
    chain=PromptTemplate.from_template(template=query) | llm
    vectorstore=PineconeVectorStore(index_name="earthdata",embedding=embeddings)
    retrieval_qa_chat_prompt=hub.pull("langchain-ai/retrieval-qa-chat")
    combine_docs_chain=create_stuff_documents_chain(llm,retrieval_qa_chat_prompt)
    retrieval_chain=create_retrieval_chain(
        retriever=vectorstore.as_retriever(),combine_docs_chain=combine_docs_chain
    )

    resume_summary=retrieval_chain.invoke(input={"input":query})
    print(resume_summary)
       
data_store()
# RAG()
