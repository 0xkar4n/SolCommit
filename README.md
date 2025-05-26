<p align="center">
  <img src="https://github.com/user-attachments/assets/6d8340c9-96c8-439c-b524-6bb105993f6c" alt="SolCommit Logo" width="120">
</p>

 SolCommit is a web application that provides a unique visualization of your Solana transaction history. By simply entering your Solana wallet address, you can generate a transaction heatmap and gain valuable insights into your on-chain activity.

---

## ✨ What You Can See

SolCommit transforms raw Solana transaction data into an easily digestible visual and statistical summary. Here's what you can explore:

### Solana Transaction Heatmap

Get a clear, color-coded overview of your transaction activity over time. Days with higher transaction volume will appear "hotter" on the calendar, allowing you to quickly identify periods of intense on-chain interaction.

![image](https://github.com/user-attachments/assets/8cc5a557-207c-4549-9d6e-31c67d9c5814)
 ### Transaction Summary Data

Beyond the visual, SolCommit provides key metrics to quantify your Solana wallet's activity:

* **Total Transactions:** The grand total of all transactions associated with your wallet address.
* **Total Transactions (1yr):** The number of transactions conducted within the last year, giving you a recent activity snapshot.
* **Active Days (1yr):** The count of unique days within the last year where your wallet had at least one transaction, indicating your consistent engagement.
* **Busiest Day:** Highlights the single day with the highest number of transactions, revealing peak activity periods.
* **Total Fees (SOL):** The cumulative amount of Solana (SOL) spent on transaction fees from your wallet.

![image](https://github.com/user-attachments/assets/e3c73f3d-a5bd-4e71-b0a5-10a3e4a7fd91)
 ---

## 🛠️ How It Works

SolCommit leverages **Sim**, a real-time multichain developer platform powered by Dune. Sim is designed to power the next generation of onchain apps by providing real-time, multichain data in one platform. When you input your Solana wallet address:

1.  Your request is sent to the SolCommit backend.
2.  The backend queries **Sim** (https://sim.dune.com/), utilizing its powerful APIs to retrieve all relevant Solana transaction information for your provided address.
3.  Sim's robust infrastructure, built on Dune's extensive data analytics, processes and aggregates this vast amount of on-chain data with sub-second latency.
4.  The processed data is then sent back to SolCommit, which visualizes it as a heatmap and calculates the summary statistics presented on the frontend.

This seamless integration with Sim ensures that you receive accurate, up-to-date, and comprehensive insights into your Solana transaction history.

---

## 🤝 Contributing

We welcome contributions! If you have ideas for new features, bug fixes, or improvements, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a pull request.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).