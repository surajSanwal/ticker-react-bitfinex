import React, { useCallback, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import './styles.css';

const TradingPair = {
  CHANNEL_ID: null,
  BID: null,
  BID_SIZE: null,
  ASK: null,
  ASK_SIZE: null,
  DAILY_CHANGE: null,
  DAILY_CHANGE_RELATIVE: null,
  LAST_PRICE: null,
  VOLUME: null,
  HIGH: null,
  LOW: null,
};

var flatArray = (array: any[]) => {
  return array.reduce((i, j: number | any[]) => {
    if (typeof j === 'object' && j.length) {
      i.push(...flatArray(j));
    } else {
      i.push(j);
    }
    return i;
  }, []);
};
export function Masthead() {
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState('wss://api-pub.bitfinex.com/ws/2');
  const [messageHistory, setMessageHistory] = useState<any[]>([]);
  const [tradeData, setTradeData] = useState<any>(TradingPair);
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);

  const onMessage = useCallback(
    message => {
      let lastMessageData = JSON.parse(message && message.data) || {};
      if (lastMessageData.length && lastMessageData[1] !== 'hb') {
        let data = flatArray(lastMessageData);
        data = Object.keys(TradingPair).reduce((i, j, k) => {
          i[j] = data[k];
          return i;
        }, TradingPair);
        setTradeData(data);
        setTradeHistory([...tradeHistory, data]);
      } else {
        setMessageHistory([...messageHistory, lastMessageData]);
      }
    },
    [messageHistory, tradeHistory],
  );

  const { sendMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => {
      let msg: any = JSON.stringify({
        event: 'subscribe',
        channel: 'ticker',
        symbol: 'tBTCUSD',
      });
      sendMessage(msg);
    },
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: closeEvent => false,
    onMessage: onMessage,
  });

  const connectionStatus = {
    [ReadyState.UNINSTANTIATED]: 'UNINSTANTIATED',
    [ReadyState.CONNECTING]: 'CONNECTING',
    [ReadyState.OPEN]: 'OPEN',
    [ReadyState.CLOSING]: 'CLOSING',
    [ReadyState.CLOSED]: 'CLOSED',
  };

  const handleConnection = useCallback(() => {
    let url =
      socketUrl === 'wss://api-pub.bitfinex.com/ws/2'
        ? 'ws://abc.com'
        : 'wss://api-pub.bitfinex.com/ws/2';
    setSocketUrl(url);
  }, [socketUrl]);
  return (
    <div>
      {readyState === ReadyState.OPEN ? (
        <div className="background">
          <section className="ticker">
            <div className="ticker_container">
              <div className="ticker_icon">
                <span className="btc_img"></span>
              </div>
              <div className="ticker_data">
                <div className="data-container">
                  <div className="left">
                    <div>
                      <span className="heading_span">
                        <span>
                          <span>BTC</span>
                          <span className="soft">/</span>
                          <span>USD</span>
                        </span>
                      </span>
                    </div>
                    <div>
                      <span className="soft">VOL</span>
                      <span className="heading_span">
                        <span>
                          {parseFloat(tradeData['VOLUME']).toFixed(0)}
                        </span>
                      </span>
                      <span className="soft underline">BTC</span>
                    </div>
                    <div>
                      <span className="soft">LOW</span>
                      <span>{tradeData['LOW']}</span>
                    </div>
                  </div>

                  <div className="right">
                    <div>
                      <span className="heading_span">
                        {parseFloat(tradeData['BID']).toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span
                        className="green_text"
                        style={{
                          color:
                            Math.sign(tradeData['DAILY_CHANGE']) > 1
                              ? 'green'
                              : 'red',
                        }}
                      >
                        <span>
                          {parseFloat(
                            Math.abs(tradeData['DAILY_CHANGE']).toString(),
                          ).toFixed(2)}
                        </span>
                        <i
                          className={
                            Math.sign(tradeData['DAILY_CHANGE']) > 1
                              ? 'fa fa-caret-up fa-fw'
                              : 'fa fa-caret-down fa-fw'
                          }
                        ></i>
                        (
                        <span>
                          {parseFloat(
                            Math.abs(
                              tradeData['DAILY_CHANGE_RELATIVE'],
                            ).toString(),
                          ).toFixed(2)}
                        </span>
                        %)
                      </span>
                    </div>
                    <div>
                      <span className="soft">HIGH</span>
                      <span>{tradeData['HIGH']}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
      <div className="wrapper">
        <div>
          <span className="soft">Connection Status</span>:
          <span>{connectionStatus[readyState]}</span>
        </div>
        <div>
          <button
            onClick={handleConnection}
            className={
              readyState === ReadyState.OPEN ||
              readyState === ReadyState.CONNECTING
                ? ''
                : 'connected'
            }
          >
            {readyState === ReadyState.OPEN ||
            readyState === ReadyState.CONNECTING
              ? 'Disconnect'
              : 'Connect'}
          </button>
        </div>
        {/* <div className="tradeData">
          <p>Current Trade</p>
          <div>
            {Object.keys(tradeData).map((i, key) => (
              <p key={key}>
                <span>{i}</span>:{tradeData[i]}
              </p>
            ))}
          </div>
        </div> */}
        {/* <div className="tradeData">
          <p>Event History</p>
          {messageHistory.map((i, j) => (
            <div key={j}>
              <p>
                {i.event}:{i.serverId}
              </p>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}
