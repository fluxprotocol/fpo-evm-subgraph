import { Address, BigInt } from '@graphprotocol/graph-ts'
import { PriceFeed as PriceFeedSchema, Transmission } from "../generated/schema"
import {
  NewTransmission
} from "../generated/FluxPriceFeedV1/FluxPriceFeedV1"
import { FluxPriceFeedV1 as PriceFeedV1Contract } from "../generated/FluxPriceFeedV1/FluxPriceFeedV1"
import { amberdataFeeds, fluxFeeds } from './providers'

// Finds and/or creates PriceFeed entity if it doesn't exist
function getPriceFeedEntity(address: Address): void {
  let priceFeed = PriceFeedSchema.load(address)
  if (!priceFeed) {
    let priceFeed = new PriceFeedSchema(address)

    let contract = PriceFeedV1Contract.bind(address)
    priceFeed.address = address
    priceFeed.type = "Individual" 
    priceFeed.pair = contract.description()
    priceFeed.decimals = BigInt.fromI32(contract.decimals())

    // If the contract is an Amberdata feed, set the provider to the Amberdata feed address
    if (amberdataFeeds.includes(address.toHexString().toLowerCase())) {
      priceFeed.provider = "Amberdata"
    } else if (fluxFeeds.includes(address.toHexString().toLowerCase())) {
      priceFeed.provider = "Flux"
    }

    priceFeed.save()
  }
}

// Individual FluxPriceFeed `transmit()` event
export function handleNewTransmission(
  event: NewTransmission
): void {

  let transmission = new Transmission(event.transaction.hash)

  getPriceFeedEntity(event.address)  

  transmission.price_feed = event.address
  transmission.round_id = event.params.aggregatorRoundId
  transmission.answer = event.params.answer
  transmission.timestamp = event.block.timestamp
  transmission.num_answers = BigInt.fromI32(1)

  transmission.save()
}
