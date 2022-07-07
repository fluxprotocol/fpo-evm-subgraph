import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { PriceFeed as PriceFeedSchema, Transmission } from "../generated/schema"
import {
  PriceFeedCreated,
  PriceFeedSignersModified,
  PriceFeedTransmitted
} from "../generated/FluxP2PFactory/FluxP2PFactory"
import { FluxPriceFeedV2 as PriceFeedV2Contract } from "../generated/FluxP2PFactory/FluxPriceFeedV2"

// P2PFactory `createOracle()` event
export function handlePriceFeedCreated(event: PriceFeedCreated): void {
  let priceFeed = new PriceFeedSchema(event.params.id)

  let contract = PriceFeedV2Contract.bind(event.params.oracle)
  priceFeed.address = event.params.oracle
  priceFeed.type = "P2PFactory" 
  priceFeed.pair = contract.description()
  priceFeed.decimals = BigInt.fromI32(contract.decimals())
  priceFeed.creator = event.transaction.from
  priceFeed.signers = event.params.signers.map<Bytes>(s => changetype<Bytes>(s))

  priceFeed.save()
}

// P2PFactory `modifySigners()` event
export function handlePriceFeedSignersModified(
  event: PriceFeedSignersModified
): void {
  let priceFeed = PriceFeedSchema.load(event.params.id)
  if (!priceFeed) {
    return
  }

  if (event.params.isAdded == true) {
    priceFeed.signers.push(event.params.signer)
  } else {
    let index = priceFeed.signers.indexOf(event.params.signer)
    if (index > -1) {
      priceFeed.signers.splice(index, 1);
    }
  }

  priceFeed.save()
}

// P2PFactory `transmit()` event
export function handleNewTransmission(
  event: PriceFeedTransmitted
): void {

  let transmission = new Transmission(event.transaction.hash)

  transmission.price_feed = event.params.id
  transmission.round_id = event.params.roundId
  transmission.answer = event.params.answer
  transmission.timestamp = event.params.timestamp
  transmission.num_answers = event.params.numAnswers

  transmission.save()
}
