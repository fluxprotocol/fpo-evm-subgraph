import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { FluxPriceFeed as PriceFeedContract } from "../generated/templates/FluxPriceFeed/FluxPriceFeed"
import { PriceFeed as PriceFeedSchema, Transmission } from "../generated/schema"
import {
  PriceFeedCreated,
  PriceFeedSignersModified,
  PriceFeedTransmitted
} from "../generated/FluxP2PFactory/FluxP2PFactory"

export function handlePriceFeedCreated(event: PriceFeedCreated): void {
  let entity = new PriceFeedSchema(event.params.id)

  let contract = PriceFeedContract.bind(event.params.oracle)
  entity.address = event.params.oracle
  entity.pair = contract.description()
  entity.decimals = BigInt.fromI32(contract.decimals())
  entity.creator = event.transaction.from
  entity.signers = event.params.signers.map<Bytes>(s => changetype<Bytes>(s))
  entity.save()

}

export function handlePriceFeedSignersModified(
  event: PriceFeedSignersModified
): void {
  let entity = PriceFeedSchema.load(event.params.id)
  if (!entity) {
    return
  }

  if (event.params.isAdded == true) {
    entity.signers.push(event.params.signer)
  } else {
    let index = entity.signers.indexOf(event.params.signer)
    if (index > -1) {
      entity.signers.splice(index, 1);
    }
  }

  entity.save()
}

export function handleNewTransmission(
  event: PriceFeedTransmitted
): void {

  let entity = new Transmission(event.transaction.hash)

  entity.price_feed = event.params.id
  entity.round_id = event.params.roundId
  entity.answer = event.params.answer
  entity.timestamp = event.params.timestamp
  entity.num_answers = event.params.numAnswers

  entity.save()
}
