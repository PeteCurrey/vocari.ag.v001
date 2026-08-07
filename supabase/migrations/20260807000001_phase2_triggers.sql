-- Phase 2 Migration: Tier-A Publish Gate Trigger & Review Queue Tables

-- 1. PostgreSQL Trigger Function to enforce Tier-A Publish Constraint
CREATE OR REPLACE FUNCTION check_tier_a_publication_gate()
RETURNS TRIGGER AS $$
DECLARE
  unconfirmed_routes_count INTEGER;
  unconfirmed_steps_count INTEGER;
  unconfirmed_reqs_count INTEGER;
  unconfirmed_reg_reqs_count INTEGER;
BEGIN
  -- Only enforce when trying to publish a Tier-A occupation
  IF NEW.published = TRUE AND NEW.tier = 'A' THEN
    
    -- Check routes for this occupation
    SELECT COUNT(*) INTO unconfirmed_routes_count
    FROM routes
    WHERE occupation_id = NEW.id
      AND (confidence != 'confirmed' OR verified_by IS NULL OR verified_at IS NULL);

    IF unconfirmed_routes_count > 0 THEN
      RAISE EXCEPTION 'TIER_A_PUBLISH_GATE_VIOLATION: Occupation % (Tier A) cannot be published because % route(s) are unconfirmed or unverified.', NEW.id, unconfirmed_routes_count;
    END IF;

    -- Check steps for routes belonging to this occupation
    SELECT COUNT(*) INTO unconfirmed_steps_count
    FROM steps s
    JOIN routes r ON s.route_id = r.id
    WHERE r.occupation_id = NEW.id
      AND (s.confidence != 'confirmed' OR s.verified_by IS NULL OR s.verified_at IS NULL);

    IF unconfirmed_steps_count > 0 THEN
      RAISE EXCEPTION 'TIER_A_PUBLISH_GATE_VIOLATION: Occupation % (Tier A) cannot be published because % step(s) are unconfirmed or unverified.', NEW.id, unconfirmed_steps_count;
    END IF;

    -- Check requirements for steps belonging to this occupation
    SELECT COUNT(*) INTO unconfirmed_reqs_count
    FROM requirements req
    JOIN steps s ON req.step_id = s.id
    JOIN routes r ON s.route_id = r.id
    WHERE r.occupation_id = NEW.id
      AND (req.confidence != 'confirmed' OR req.verified_by IS NULL OR req.verified_at IS NULL);

    IF unconfirmed_reqs_count > 0 THEN
      RAISE EXCEPTION 'TIER_A_PUBLISH_GATE_VIOLATION: Occupation % (Tier A) cannot be published because % requirement(s) are unconfirmed or unverified.', NEW.id, unconfirmed_reqs_count;
    END IF;

    -- Check registration requirements for this occupation
    SELECT COUNT(*) INTO unconfirmed_reg_reqs_count
    FROM registration_requirements
    WHERE occupation_id = NEW.id
      AND (confidence != 'confirmed' OR verified_by IS NULL OR verified_at IS NULL);

    IF unconfirmed_reg_reqs_count > 0 THEN
      RAISE EXCEPTION 'TIER_A_PUBLISH_GATE_VIOLATION: Occupation % (Tier A) cannot be published because % registration requirement(s) are unconfirmed or unverified.', NEW.id, unconfirmed_reg_reqs_count;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Bind trigger to occupations table BEFORE INSERT OR UPDATE
DROP TRIGGER IF EXISTS trigger_tier_a_publication_gate ON occupations;
CREATE TRIGGER trigger_tier_a_publication_gate
  BEFORE INSERT OR UPDATE ON occupations
  FOR EACH ROW
  EXECUTE FUNCTION check_tier_a_publication_gate();
