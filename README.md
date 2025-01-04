
# Savy - Job Interview Simulation Mobile App

 Savy is an AI-powered job interview simulation mobile application designed to help job seekers practice and prepare for interviews.

## 🛠️ Built with

  <a href="https://docs.expo.dev/">
    <img src="https://miro.medium.com/v2/resize:fit:512/1*kepX0EHTbLc6O9mRKsierg.png" width="120" height="35" alt="Expo" />
  </a>
  <a href="https://tailwindcss.com/docs/installation">
    <img src="https://laravelnews.s3.amazonaws.com/images/tailwindcss-1633184775.jpg" width="120" height="35" alt="Tailwind CSS" />
  </a>
  <a href="https://fastapi.tiangolo.com/">
    <img src="https://assets.tivadardanka.com/2021_11_fastapi_featured_5d7f0b1c1e.png" width="120" height="35" alt="FastAPI" />
  </a>
  <a href="https://supabase.com/docs">
    <img src="https://getlogo.net/wp-content/uploads/2020/11/supabase-logo-vector.png" width="120" height="35" alt="Supabase" />
</p>

## Packages Included:

* [React Native](https://reactnative.dev/) built with [Expo](https://docs.expo.dev/)

* [TypeScript](https://www.typescriptlang.org/) for static type checking

* [Clerk](https://clerk.com/docs) for user authentication

* [FastAPI](https://fastapi.tiangolo.com/) for backend

* [Supabase](https://supabase.com/docs) for database management

* [OpenAI](https://platform.openai.com/docs/overview) for AI-powered feedback, question generation, and speech to text

* [AWS Amazon Polly](https://aws.amazon.com/free/machine-learning/?gclid=CjwKCAiA1eO7BhATEiwAm0Ee-FC2buAiyMTseXCKbblihHIcGL5m5oAIJ3oUxV7DEs1xIMLAMNwGMhoCdO0QAvD_BwE&trk=79f6e5e1-b2ed-414e-8aeb-2c258885fa60&sc_channel=ps&ef_id=CjwKCAiA1eO7BhATEiwAm0Ee-FC2buAiyMTseXCKbblihHIcGL5m5oAIJ3oUxV7DEs1xIMLAMNwGMhoCdO0QAvD_BwE:G:s&s_kwcid=AL!4422!3!531174387034!e!!g!!aws%20tts!11543056237!112002963269) for text-to-speech functionality

* [Jest](https://docs.expo.dev/develop/unit-testing/) for running unit tests

* [Prettier](https://prettier.io/docs/en/) for code formatting


<!-- GETTING STARTED -->
## 🚀 Getting Started

To get a local copy up and running follow these simple example steps.

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/Team-SYV/SYV.git
    ```

2. Navigate to the project directory:

    ```bash
    cd Savy
    ```

3. Install the dependencies:

    ```bash
    npm install   # If you use npm
        or
    yarn install  # If you use yarn
    ```

4. Set up the environment variables by creating a .env file in the root directory and adding the necessary keys for services like Clerk, OpenAI, Supabase, and AWS.

   ```bash
   # Clerk API Keys
   CLERK_SECRET_KEY=your_clerk_api_key
   WEBHOOK_SECRET=your_webhook_secret

   # OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key

   # Supabase API Keys
   SUPABASE_URL=your_supabase_url
   SUPABASE_API_KEY=your_supabase_api_key

   # AWS Polly Credentials
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=your_aws_region
   ```


5. Run the app locally using Expo:

   ```bash
   npx expo start
   ```

### 🧪 Running Tests

  To run the test suite, use:

  ```bash
  npm run test
  ```



