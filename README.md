
# ChessLand

Welcome to ChessLand, a web application where you can play chess against AI or challenge your friends! This app provides a user-friendly interface for playing chess online, making it easy for both beginners and experienced players to enjoy the game.

## Features

- Play against AI: Challenge our intelligent AI opponent and improve your chess skills.
- Play with a friend: Invite your friend to a game and play together.
- Interactive interface: Enjoy a visually appealing and intuitive user interface for a seamless gaming experience.
- Move validation: The app ensures that all moves adhere to the rules of chess.
- Game history: Access a log of your moves throughout the game for review and analysis.
- Undo moves: Made a mistake? No worries! You can undo moves and correct your strategy.
- Promote pawns: Automatically promote your pawns to any desired piece upon reaching the eighth rank.
- Game status indicators: Stay updated with the current game status, including checkmate, stalemate, and draw.
- Responsive design: The app adapts to different screen sizes, allowing you to play on desktops, tablets, or mobile devices.

## Demo

You can try out ChessLand by visiting our [live demo](https://chessland.netlify.app/) hosted on Linode and Netlify.
Also, here are some real footage you can watch:
#### Singleplayer (vs AI):
<img src='https://github.com/dominhnhut01/chessgame_webapp/blob/main/singleplayer_demo.gif?raw=true' title='Singleplayer Demo' width='900' alt='Singleplayer Demo' />

#### Multiplayer (invite your friend):
<img src='https://github.com/dominhnhut01/chessgame_webapp/blob/main/multiplayer_demo.gif?raw=true' title='Multiplayer Demo' width='900' alt='Multiplayer Demo' />

## Technologies Used

### Frontend
- React: JavaScript library for building user interfaces.
- Socket.io: Real-time communication library for enabling multiplayer functionality.

### Backend
- Minimax search for AI agent: An algorithm used for AI opponents in chess that makes optimal decisions based on game tree exploration, can explore over 3 million moves in future.
- Socket.io: Real-time communication library for enabling multiplayer functionality.
- Node.js + TypeScript

### Deployment
- Manually deployed with NGINX on Linode Linux Server

## Future Improvement
- Adding Stockfish engine to AI opponent.
- Adding video chat feature in multiplayer mode to enhance player interaction

## Reference
<a href="https://www.flaticon.com/free-stickers/animals" title="animals stickers">Animals stickers created by Stickers - Flaticon</a>
