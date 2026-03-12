<template>
  <div class="about-view">
    <div class="about-hero card">
      <span class="overline">ABOUT THE PLATFORM</span>
      <h1>Preserving Genealogical Heritage</h1>
      <p class="lead">
        A national platform dedicated to documenting, preserving, and exploring
        the genealogical heritage of our people across generations and regions.
      </p>
    </div>

    <div class="about-sections">
      <div class="card about-section">
        <h2>Our Mission</h2>
        <p>
          We believe that understanding where we come from shapes who we are.
          This platform provides a trusted, institutional space for communities
          to record, explore, and share family histories — from ancient lineages
          to modern family records.
        </p>
      </div>

      <div class="card about-section">
        <h2>How It Works</h2>
        <div class="steps">
          <div class="step" v-for="step in steps" :key="step.num">
            <div class="step-num">{{ step.num }}</div>
            <div>
              <h4>{{ step.title }}</h4>
              <p>{{ step.body }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card about-section">
        <h2>Access &amp; Privacy</h2>
        <p>
          Individuals can be marked as <strong>Public</strong> (visible to all) or
          <strong>Private</strong> (visible only to registered users with access).
          New submissions default to private and require moderator approval before publication.
        </p>
      </div>
    </div>

    <div class="about-cta card">
      <h2>Ready to Contribute?</h2>
      <p>Join the community and help preserve genealogical records for future generations.</p>
      <div class="cta-actions">
        <router-link to="/register" class="btn-accent">Create Account</router-link>
        <router-link to="/tree" class="btn-secondary">Explore the Tree</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
const steps = [
  { num: 1, title: 'Search & Discover', body: 'Find individuals by name, clan, region, or designation using our full-text search.' },
  { num: 2, title: 'Explore the Tree', body: 'Navigate the interactive family tree with zoom, pan, and path-finding between any two people.' },
  { num: 3, title: 'Contribute', body: 'Register to add family members, submit edits, and help expand the collective record.' },
  { num: 4, title: 'Moderated Quality', body: 'All submissions go through a moderation workflow to ensure accuracy and integrity.' },
]
</script>

<style scoped>
.about-view {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: var(--c-bg-2);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 1px 3px var(--c-shadow);
}

.about-hero {
  text-align: center;
  border-bottom: 3px solid var(--c-gold);
}

.overline {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-gold);
  margin-bottom: 12px;
}

h1 { font-size: 32px; font-weight: 700; color: var(--c-text); margin-bottom: 16px; }

.lead {
  font-size: 15px;
  color: var(--c-text-2);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
}

.about-sections { display: flex; flex-direction: column; gap: 24px; }

.about-section h2 {
  font-size: 22px;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--c-border);
}

.about-section p { font-size: 15px; color: var(--c-text); line-height: 1.7; }

.steps { display: flex; flex-direction: column; gap: 20px; margin-top: 8px; }

.step { display: flex; gap: 16px; align-items: flex-start; }

.step-num {
  width: 32px;
  height: 32px;
  background: var(--c-primary-d);
  color: var(--c-bg-2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.step h4 { font-size: 15px; font-weight: 600; color: var(--c-text); margin-bottom: 4px; }
.step p  { font-size: 14px; color: var(--c-text-2); }

.about-cta {
  text-align: center;
  background: var(--c-fill-3);
}

.about-cta h2 { font-size: 24px; font-weight: 600; color: var(--c-text); margin-bottom: 12px; }
.about-cta p  { font-size: 15px; color: var(--c-text-2); margin-bottom: 24px; }

.cta-actions { display: flex; justify-content: center; gap: 12px; }

.btn-accent {
  display: inline-block;
  background: var(--c-gold);
  color: var(--c-bg-2);
  border: none;
  border-radius: 4px;
  padding: 10px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}
.btn-accent:hover { background: var(--c-gold-d); }

.btn-secondary {
  display: inline-block;
  background: transparent;
  color: var(--c-text);
  border: 1px solid var(--c-sep-opaque);
  border-radius: 4px;
  padding: 10px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}
.btn-secondary:hover { background: var(--c-sep-opaque); }
</style>
