import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { FluxPriceFeed as PriceFeedTemplate } from "../generated/templates"
import { FluxPriceFeed as PriceFeedContract, NewTransmission } from "../generated/templates/FluxPriceFeed/FluxPriceFeed"
import { PriceFeed as PriceFeedSchema, Transmission } from "../generated/schema"
import {
  FluxP2PFactory,
  PriceFeedCreated,
  PriceFeedSignersModified
} from "../generated/FluxP2PFactory/FluxP2PFactory"

export function handlePriceFeedCreated(event: PriceFeedCreated): void {
  let entity = new PriceFeedSchema(event.params.oracle)

  let contract = PriceFeedContract.bind(event.params.oracle)
  entity.pair = contract.description()
  entity.decimals = BigInt.fromI32(contract.decimals())
  entity.creator = event.transaction.from
  entity.signers = event.params.signers.map<Bytes>(s => changetype<Bytes>(s))
  
  PriceFeedTemplate.create(event.params.oracle)

  entity.save()
}

export function handlePriceFeedSignersModified(
  event: PriceFeedSignersModified
): void {
  let entity = PriceFeedSchema.load(
    FluxP2PFactory.bind(event.address).addressOfPricePair(event.params.id)
  )
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
  event: NewTransmission
): void {

  let entity = new Transmission(event.transaction.hash)

  entity.price_feed = event.address
  entity.round_id = event.params.aggregatorRoundId
  entity.answer = event.params.answer
  entity.timestamp = event.params.timestamp

  entity.save()
}
